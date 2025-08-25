import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query as { code?: string };
  if (!code) return res.status(400).json({ error: "code required" });

  if (req.method === "GET") {
    return (async () => {
      const { data, error } = await supabase
        .from("room")
        .select("code,name,created_at")
        .eq("code", String(code).toUpperCase())
        .single();
      if (error) {
        if ((error as any)?.code === "PGRST116") {
          return res.status(404).json({ error: "Room not found" });
        }
        return res.status(500).json({ error: error.message });
      }
      if (!data) return res.status(404).json({ error: "Room not found" });
      return res.status(200).json({ room: data });
    })();
  }

  return res.status(405).json({ error: "Method not allowed" });
}
