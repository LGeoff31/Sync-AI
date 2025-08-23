import type { NextApiRequest, NextApiResponse } from "next";
import { createRoom } from "@/lib/roomsStore";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { name } = req.body || {};
    const room = createRoom(typeof name === "string" ? name : "");
    const payload = {
      code: room.code,
      name: room.name,
      created_at: new Date().toISOString(),
    } as const;
    const { error } = await supabase.from("room").insert([payload]);
    if (error) return res.status(500).json({ room, error: error.message });

    return res.status(200).json({ room });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
