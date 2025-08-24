import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { createRoom } from "@/lib/roomsStore";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email)
      return res.status(401).json({ error: "Not authenticated" });
    const email = session.user.email;
    const { data, error } = await supabase
      .from("room")
      .select("code,name,created_at,created_by")
      .eq("created_by", email)
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ rooms: data || [] });
  } else if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email)
      return res.status(401).json({ error: "Not authenticated" });
    const { name } = req.body || {};
    const room = createRoom(typeof name === "string" ? name : "");
    const payload = {
      code: room.code,
      name: room.name,
      created_at: new Date().toISOString(),
      created_by: session.user.email,
    } as const;
    const { error } = await supabase.from("room").insert([payload]);
    if (error) return res.status(500).json({ room, error: error.message });

    return res.status(200).json({ room });
  }
  return res.status(405).json({ error: "Method not allowed" });
}
