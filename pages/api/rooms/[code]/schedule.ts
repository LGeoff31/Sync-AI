import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { supabase } from "@/lib/supabase";
import { getUserGoogleAccessToken, createPrimaryEvent } from "@/lib/google";
import { suggestActivity } from "@/lib/ai";
import { findPopularPlaces } from "@/lib/places";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email)
    return res.status(401).json({ error: "Not authenticated" });

  const { code } = req.query as { code?: string };
  if (!code) return res.status(400).json({ error: "code required" });

  const { window } = req.body as { window?: { start: string; end: string } };
  if (!window?.start || !window?.end)
    return res.status(400).json({ error: "window required" });

  const { data: members, error } = await supabase
    .from("room_member")
    .select("user_email")
    .eq("room_code", String(code).toUpperCase());
  if (error) return res.status(500).json({ error: error.message });
  const emails = (members || [])
    .map((m) => m.user_email as string)
    .filter(Boolean);
  if (emails.length === 0) return res.status(400).json({ error: "No members" });

  const { data: profiles } = await supabase
    .from("user_profile")
    .select("user_email,bio")
    .in("user_email", emails);
  const suggestion = await suggestActivity({
    members: emails.map((e) => ({
      email: e,
      bio: profiles?.find((p) => p.user_email === e)?.bio || null,
    })),
    free: [window],
  });
  const title = suggestion?.title || "Group Activity";
  let description = suggestion?.description || "Scheduled by SyncAI";

  const { data: locRows } = await supabase
    .from("user_location")
    .select("user_email,lat,lon")
    .in("user_email", emails);
  const coords = (locRows || []).filter(
    (r) => typeof r.lat === "number" && typeof r.lon === "number"
  ) as { lat: number; lon: number }[];
  let placeUrl: string | undefined;
  if (coords.length > 0) {
    const centroid = coords.reduce(
      (acc, c) => ({ lat: acc.lat + c.lat, lon: acc.lon + c.lon }),
      { lat: 0, lon: 0 }
    );
    centroid.lat /= coords.length;
    centroid.lon /= coords.length;

    const places = await findPopularPlaces(centroid.lat, centroid.lon, title);
    if (places.length > 0) {
      const p = places[0];
      placeUrl = p.url;
      description = `${description}\nVenue: ${p.name}${
        p.address ? `, ${p.address}` : ""
      }${p.url ? `\n${p.url}` : ""}`;
    }
  }

  const attendees = emails.map((e) => ({ email: e }));
  const results: { email: string; eventId?: string | null; status?: number }[] =
    [];
  for (const email of emails) {
    const { accessToken } = await getUserGoogleAccessToken(email);
    if (!accessToken) {
      results.push({ email, eventId: null });
      continue;
    }
    const evt = await createPrimaryEvent(accessToken, {
      summary: title,
      description,
      start: { dateTime: window.start },
      end: { dateTime: window.end },
      attendees,
    });
    results.push({ email, eventId: evt?.id || null, status: evt?.status });
  }

  return res.status(200).json({ title, description, results, placeUrl });
}
