import type { NextApiRequest, NextApiResponse } from "next";
import { createRoom } from "@/lib/roomsStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { name } = req.body || {};
    const room = createRoom(typeof name === "string" ? name : "");
    return res.status(200).json({ room });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
