import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email)
    return res.status(401).json({ error: "Not authenticated" });

  const email = session.user.email;

  if (req.method === "POST") {
    const { lat, lon } = req.body as { lat?: number; lon?: number };
    if (typeof lat !== "number" || typeof lon !== "number")
      return res.status(400).json({ error: "lat/lon required" });

    const { error } = await supabase.from("user_location").upsert(
      [
        {
          user_email: email,
          lat,
          lon,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: "user_email" }
    );
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("user_location")
      .select("user_email,lat,lon,updated_at")
      .eq("user_email", email)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ location: data || null });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
