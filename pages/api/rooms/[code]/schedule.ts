import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { supabase } from "@/lib/supabase";
import { getUserGoogleAccessToken, createPrimaryEvent } from "@/lib/google";
import { suggestActivity } from "@/lib/ai";

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

  const suggestion = await suggestActivity({
    members: emails.map((e) => ({ email: e })),
    free: [window],
  });
  const title = suggestion?.title || "Group Activity";
  const description = suggestion?.description || "Scheduled by SyncAI";

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

  return res.status(200).json({ title, description, results });
}
