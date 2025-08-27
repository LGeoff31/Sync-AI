import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import copy from "copy-to-clipboard";
import { FaRegClipboard, FaClipboardCheck } from "react-icons/fa";
import RoomCalendar, { type RoomCalendarData } from "@/components/RoomCalendar";
import { useSession, signIn } from "next-auth/react";

function InviteLink({ code }: { code: string }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/rooms/${code}`;
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <code className="block rounded bg-slate-900/60 px-3 py-2 text-white ring-1 ring-white/10 break-all">
        {url}
      </code>
      <button
        onClick={() => {
          copy(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="rounded-md bg-indigo-500 px-3 py-2 font-medium text-slate-900 hover:bg-indigo-400 transition cursor-pointer"
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        title={copied ? "Copied" : "Copy to clipboard"}
      >
        {copied ? <FaClipboardCheck /> : <FaRegClipboard />}
      </button>
    </div>
  );
}

export default function RoomPage() {
  const router = useRouter();
  const { code } = router.query as { code?: string };
  const { status } = useSession();
  const [state, setState] = useState<{
    loading: boolean;
    name?: string;
    error?: string;
    members?: { user_email: string; user_name: string; joined_at: string }[];
    free?: { start: string; end: string }[];
    calendar?: RoomCalendarData;
  }>({ loading: true });
  const [selectedWindow, setSelectedWindow] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    const STORAGE_KEY = "__LAST_GEO_UPLOAD__";
    try {
      const last =
        typeof window !== "undefined"
          ? Number(window.localStorage.getItem(STORAGE_KEY) || "0")
          : 0;
      // Only attempt at most every 6 hours
      if (last && Date.now() - last < 6 * 60 * 60 * 1000) return;
    } catch {}

    if (typeof navigator === "undefined" || !("geolocation" in navigator))
      return;

    // If Permissions API exists and is explicitly denied, skip prompting
    const checkAndRequest = async () => {
      try {
        const perms = (
          navigator as Navigator & {
            permissions?: {
              query: (desc: { name: "geolocation" }) => Promise<{
                state?: PermissionState;
              }>;
            };
          }
        ).permissions;
        if (perms?.query) {
          const result = await perms.query({ name: "geolocation" });
          if (result?.state === "denied") return;
        }
      } catch {}

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const r = await fetch(`/api/user/location`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
              }),
            });
            if (r.ok) {
              try {
                if (typeof window !== "undefined") {
                  window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
                }
              } catch {}
            }
          } catch {}
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    };

    checkAndRequest();
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (!code) return;
    if (status !== "authenticated") return;
    const fetchAll = async () => {
      try {
        await fetch(`/api/rooms/${code}/members`, { method: "POST" });
      } catch {}

      const [resM, resRoom, resAvail] = await Promise.all([
        fetch(`/api/rooms/${code}/members`),
        fetch(`/api/rooms/${code}`),
        fetch(`/api/rooms/${code}/availability`),
      ]);
      const dataM = await resM.json().catch(() => ({ members: [] }));
      const roomPayload = await resRoom.json().catch(() => ({}));
      const roomName =
        resRoom.ok && roomPayload?.room?.name
          ? roomPayload.room.name
          : undefined;

      const availPayload = await resAvail
        .json()
        .catch(() => ({ free: [], range: undefined }));

      setState((s) => ({
        loading: false,
        name: roomName,
        members: Array.isArray(dataM?.members)
          ? dataM.members
          : s.members || [],
        free: Array.isArray(
          (availPayload as { free?: { start: string; end: string }[] })?.free
        )
          ? ((availPayload as { free?: { start: string; end: string }[] })
              .free as { start: string; end: string }[])
          : s.free || [],
        calendar: {
          members: [],
          commonFree: Array.isArray(
            (availPayload as { free?: { start: string; end: string }[] })?.free
          )
            ? ((availPayload as { free?: { start: string; end: string }[] })
                .free as { start: string; end: string }[])
            : [],
          range: (
            availPayload as { range?: { timeMin: string; timeMax: string } }
          )?.range,
        },
      }));
    };

    fetchAll();
  }, [code, status]);

  if (status === "loading")
    return <div className="px-6 py-12 text-white/80">Checking session...</div>;
  if (status !== "authenticated") return null;

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {state.loading && <p className="text-white/80">Loading...</p>}
        {state.error && <p className="text-red-400">{state.error}</p>}
        {!state.loading && !state.error && (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <RoomCalendar
              data={state.calendar}
              onSelectWindow={setSelectedWindow}
            />

            <aside className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur h-max">
              <div className="flex items-center gap-3 justify-between">
                <h1 className="text-2xl font-semibold">
                  {state.name || "Untitled room"}
                </h1>
                <code className="rounded bg-slate-900/60 px-2 py-1 text-sm text-white/70 ring-1 ring-white/10">
                  {code}
                </code>
              </div>
              <p className="mt-1 text-sm text-white/70">
                Share this link with friends to join:
              </p>
              <div className="mt-4">
                <InviteLink code={String(code)} />
              </div>
              <div className="mt-6">
                <h2 className="text-lg font-medium">Members</h2>
                {state.members && state.members.length > 0 ? (
                  <ul className="mt-3 divide-y divide-white/10 rounded-lg border border-white/10 bg-white/5">
                    {state.members.map((m) => (
                      <li
                        key={m.user_email}
                        className="flex items-center justify-between px-4 py-2"
                      >
                        <div className="font-medium">{m.user_name}</div>
                        <div className="text-xs text-white/60">
                          {m.user_email}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-white/70">No members yet.</p>
                )}
              </div>

              <div className="mt-6">
                <button
                  disabled={!selectedWindow || isScheduling}
                  onClick={async () => {
                    if (!selectedWindow) return;
                    setIsScheduling(true);
                    try {
                      const best = selectedWindow;
                      const res = await fetch(`/api/rooms/${code}/schedule`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ window: best }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (res.ok)
                        alert(
                          `Scheduled: ${data.title}${
                            data.placeUrl ? `\n${data.placeUrl}` : ""
                          }`
                        );
                      else alert(data.error || "Failed to schedule");
                    } catch (e) {
                      alert("Network error. Please try again.");
                    } finally {
                      setIsScheduling(false);
                    }
                  }}
                  className={`w-full rounded-md px-4 py-2 font-medium transition ${
                    selectedWindow && !isScheduling
                      ? "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                      : "bg-slate-700 text-slate-400 cursor-not-allowed"
                  }`}
                  aria-busy={isScheduling}
                >
                  {isScheduling ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Scheduling…
                    </span>
                  ) : (
                    "Pick activity & schedule"
                  )}
                </button>
                {!selectedWindow && (
                  <p className="mt-2 text-xs text-white/60">
                    Hover or click a highlighted green window on the calendar to
                    select it.
                  </p>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
