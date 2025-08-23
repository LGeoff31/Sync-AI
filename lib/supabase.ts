import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
// Prefer server-side service role if available; fall back to anon
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string;

export const supabase = createClient(supabaseUrl, supabaseKey);
