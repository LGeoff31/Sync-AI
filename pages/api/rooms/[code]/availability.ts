import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { supabase } from "@/lib/supabase";
import {
  computeCommonFree,
  fetchPrimaryBusy,
  getUserGoogleAccessToken,
} from "@/lib/google";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email)
    return res.status(401).json({ error: "Not authenticated" });

  const { code } = req.query as { code?: string };
  if (!code) return res.status(400).json({ error: "code required" });

  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const now = new Date();
  const timeMin = new Date(now).toISOString();
  const timeMax = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: members, error: memErr } = await supabase
    .from("room_member")
    .select("user_email")
    .eq("room_code", String(code).toUpperCase());
  if (memErr) return res.status(500).json({ error: memErr.message });
  const emails = (members || [])
    .map((m) => m.user_email as string)
    .filter(Boolean);
  if (emails.length === 0)
    return res.status(200).json({ free: [], range: { timeMin, timeMax } });

  const busyArrays: { start: string; end: string }[][] = [];
  for (const email of emails) {
    try {
      const { accessToken } = await getUserGoogleAccessToken(email);
      if (!accessToken) {
        busyArrays.push([]);
        continue;
      }
      const busy = await fetchPrimaryBusy(accessToken, timeMin, timeMax);
      busyArrays.push(busy);
    } catch {
      busyArrays.push([]);
    }
  }

  const allBusy = busyArrays.flat();
  const commonFree = computeCommonFree(allBusy, timeMin, timeMax);
  return res
    .status(200)
    .json({ free: commonFree, range: { timeMin, timeMax } });
}
