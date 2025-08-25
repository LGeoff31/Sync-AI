import { supabase } from "@/lib/supabase";

type TokenRow = {
  user_email: string;
  provider: string;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: number | null;
  scope: string | null;
  token_type: string | null;
  updated_at: string | null;
};

function nowEpochSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export async function getUserGoogleAccessToken(
  email: string
): Promise<{ accessToken: string | null; missingConsent: boolean }> {
  const { data, error } = await supabase
    .from("user_token")
    .select(
      "user_email,provider,access_token,refresh_token,expires_at,scope,token_type,updated_at"
    )
    .eq("user_email", email)
    .eq("provider", "google")
    .maybeSingle();
  if (error) return { accessToken: null, missingConsent: true };
  const row = data as TokenRow | null;
  if (!row || !row.access_token)
    return { accessToken: null, missingConsent: true };

  const expiresAt = row.expires_at || 0;
  const isExpired = expiresAt !== 0 && expiresAt <= nowEpochSeconds() + 60;
  if (!isExpired)
    return { accessToken: row.access_token, missingConsent: false };

  if (!row.refresh_token) return { accessToken: null, missingConsent: true };

  // Refresh token
  const params = new URLSearchParams();
  params.set("client_id", process.env.GOOGLE_CLIENT_ID || "");
  params.set("client_secret", process.env.GOOGLE_CLIENT_SECRET || "");
  params.set("grant_type", "refresh_token");
  params.set("refresh_token", row.refresh_token);

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!resp.ok) return { accessToken: null, missingConsent: true };
  const json = (await resp.json()) as {
    access_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
  };
  const newAccess = json.access_token || null;
  if (!newAccess) return { accessToken: null, missingConsent: true };
  const newExpiresAt = nowEpochSeconds() + (json.expires_in || 3600);
  await supabase.from("user_token").upsert(
    [
      {
        user_email: email,
        provider: "google",
        access_token: newAccess,
        refresh_token: row.refresh_token,
        expires_at: newExpiresAt,
        scope: json.scope || row.scope,
        token_type: json.token_type || row.token_type,
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: "user_email,provider" }
  );
  return { accessToken: newAccess, missingConsent: false };
}

export type TimeInterval = { start: string; end: string }; // ISO strings

export async function fetchPrimaryBusy(
  accessToken: string,
  timeMin: string,
  timeMax: string
): Promise<TimeInterval[]> {
  const resp = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      items: [{ id: "primary" }],
    }),
  });
  if (!resp.ok) return [];
  const data = (await resp.json()) as {
    calendars?: Record<string, { busy?: { start: string; end: string }[] }>;
  };
  const calendars = data.calendars || {};
  const primary = calendars["primary"] || { busy: [] };
  return (primary.busy || []).map((b) => ({ start: b.start, end: b.end }));
}

export async function createPrimaryEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    attendees?: { email: string }[];
  }
): Promise<{ id: string | null; status?: number; error?: unknown }> {
  const url =
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all";
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(event),
  });
  if (!resp.ok) {
    let details: unknown = undefined;
    try {
      details = await resp.json();
    } catch {
      try {
        details = await resp.text();
      } catch {}
    }
    return { id: null, status: resp.status, error: details };
  }
  const data = (await resp.json()) as { id?: string };
  return { id: data?.id || null };
}

type Interval = { s: number; e: number };

function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const sorted = intervals.slice().sort((a, b) => a.s - b.s || a.e - b.e);
  const out: Interval[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const last = out[out.length - 1];
    if (cur.s <= last.e) {
      last.e = Math.max(last.e, cur.e);
    } else {
      out.push({ s: cur.s, e: cur.e });
    }
  }
  return out;
}

export function computeCommonFree(
  allBusy: TimeInterval[],
  timeMin: string,
  timeMax: string
): TimeInterval[] {
  const minTs = Date.parse(timeMin);
  const maxTs = Date.parse(timeMax);
  if (!(minTs < maxTs)) return [];

  const busyIntervals: Interval[] = allBusy
    .map((b) => ({ s: Date.parse(b.start), e: Date.parse(b.end) }))
    .filter((x) => Number.isFinite(x.s) && Number.isFinite(x.e))
    .map((x) => ({ s: Math.max(minTs, x.s), e: Math.min(maxTs, x.e) }))
    .filter((x) => x.s < x.e);

  const mergedBusy = mergeIntervals(busyIntervals);

  const free: Interval[] = [];
  let cursor = minTs;
  for (const b of mergedBusy) {
    if (cursor < b.s) free.push({ s: cursor, e: b.s });
    cursor = Math.max(cursor, b.e);
  }
  if (cursor < maxTs) free.push({ s: cursor, e: maxTs });

  return free.map((i) => ({
    start: new Date(i.s).toISOString(),
    end: new Date(i.e).toISOString(),
  }));
}
