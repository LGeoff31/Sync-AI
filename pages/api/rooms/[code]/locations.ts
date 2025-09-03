import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { code } = req.query;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Room code required" });
  }

  try {
    const { data: members, error: membersError } = await supabase
      .from("room_member")
      .select("user_email")
      .eq("room_code", code);

    if (membersError) {
      console.error("Error fetching members:", membersError);
      return res.status(500).json({ error: "Failed to fetch members" });
    }

    if (!members || members.length === 0) {
      return res.json({ locations: [] });
    }

    const memberEmails = members.map((m) => m.user_email);
    const { data: locations, error: locationsError } = await supabase
      .from("user_location")
      .select("user_email, lat, lon, updated_at")
      .in("user_email", memberEmails)
      .order("updated_at", { ascending: false });

    if (locationsError) {
      console.error("Error fetching locations:", locationsError);
      return res.status(500).json({ error: "Failed to fetch locations" });
    }

    return res.json({ locations: locations || [] });
  } catch (error) {
    console.error("Error in locations API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
