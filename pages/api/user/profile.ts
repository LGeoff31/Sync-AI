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

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("user_profile")
      .select("user_email,bio,updated_at")
      .eq("user_email", email)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ profile: data || null });
  }

  if (req.method === "POST") {
    const { bio } = req.body as { bio?: string };
    const { error } = await supabase.from("user_profile").upsert(
      [
        {
          user_email: email,
          bio: typeof bio === "string" ? bio.slice(0, 1000) : null,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: "user_email" }
    );
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
