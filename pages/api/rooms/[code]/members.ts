import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query as { code?: string };
  if (!code) return res.status(400).json({ error: "code required" });

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("room_member")
      .select("user_email,user_name,joined_at")
      .eq("room_code", code.toUpperCase())
      .order("joined_at", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ members: data || [] });
  }

  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email)
      return res.status(401).json({ error: "Not authenticated" });

    const user_email = session.user.email;
    const user_name = session.user.name || "Anonymous";

    // Upsert-like behavior: avoid duplicate rows for the same user/room
    const { error } = await supabase.from("room_member").upsert(
      [
        {
          room_code: String(code).toUpperCase(),
          user_email,
          user_name,
          joined_at: new Date().toISOString(),
        },
      ],
      { onConflict: "room_code,user_email" }
    );
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
