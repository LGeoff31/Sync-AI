import type { NextApiRequest, NextApiResponse } from "next";
import { getRoom } from "@/lib/roomsStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query as { code?: string };
  if (!code) return res.status(400).json({ error: "code required" });

  if (req.method === "GET") {
    const room = getRoom(code);
    if (!room) return res.status(404).json({ error: "Room not found" });
    return res.status(200).json({ room });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
