import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import copy from "copy-to-clipboard";
import { FaRegClipboard, FaClipboardCheck } from "react-icons/fa";
import RoomCalendar, { type RoomCalendarData } from "@/components/RoomCalendar";
import { useSession, signIn } from "next-auth/react";
import RoomMap from "@/components/RoomMap";
import Toast, { ToastProps } from "@/components/Toast";
import { fireSuccessConfetti } from "@/lib/confetti";

function InviteLink({ code }: { code: string }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/rooms/${code}`;
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <code className="flex-1 rounded-lg bg-slate-800/50 px-4 py-3 text-sm text-white ring-1 ring-white/10 break-all">
        {url}
      </code>
      <button
        onClick={() => {
          copy(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500 transition"
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
  const [locations, setLocations] = useState<
    { email: string; lat: number; lon: number; name?: string }[]
  >([]);
  const [toast, setToast] = useState<Omit<ToastProps, "onClose"> | null>(null);

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

      const [resM, resRoom, resAvail, resLoc] = await Promise.all([
        fetch(`/api/rooms/${code}/members`),
        fetch(`/api/rooms/${code}`),
        fetch(`/api/rooms/${code}/availability`),
        fetch(`/api/rooms/${code}/locations`),
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

      const locPayload = await resLoc.json().catch(() => ({ locations: [] }));
      const locs = Array.isArray(locPayload?.locations)
        ? (locPayload.locations as {
            user_email: string;
            lat: number;
            lon: number;
          }[])
        : [];

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

      // Map locations with member names
      const emailToName = new Map<string, string | undefined>(
        (Array.isArray(dataM?.members) ? dataM.members : []).map(
          (m: { user_email: string; user_name: string }) => [
            m.user_email,
            m.user_name,
          ]
        )
      );
      const finalLocations = locs.map((l) => ({
        email: l.user_email,
        lat: l.lat,
        lon: l.lon,
        name: emailToName.get(l.user_email),
      }));

      setLocations(finalLocations);
    };
    fetchAll();
  }, [code, status]);

  if (status === "loading")
    return <div className="px-6 py-12 text-white/80">Checking session...</div>;
  if (status !== "authenticated") return null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {state.loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-white/80">Loading room...</div>
        </div>
      )}

      {state.error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">{state.error}</p>
        </div>
      )}

      {!state.loading && !state.error && (
        <div className="space-y-8">
          {/* Room header */}
          <div className="border-b border-white/10 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {state.name || "Untitled room"}
                </h1>
                <div className="mt-2 flex items-center gap-4">
                  <code className="rounded-lg bg-slate-800/50 px-3 py-1 text-sm text-white/70 ring-1 ring-white/10">
                    {code}
                  </code>
                  <span className="text-sm text-white/60">
                    {state.members?.length || 0} members
                  </span>
                  <span className="text-sm text-white/60">
                    {locations.length} shared locations
                  </span>
                </div>
              </div>
            </div>

            {/* Invite section */}
            <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
              <h3 className="text-sm font-medium text-white/90 mb-3">
                Share room with friends
              </h3>
              <InviteLink code={String(code)} />
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Calendar - takes up 2 columns */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Schedule
                </h2>
                <RoomCalendar
                  data={state.calendar}
                  onSelectWindow={setSelectedWindow}
                />

                {/* Schedule button */}
                <div className="mt-6 pt-6 border-t border-white/10">
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
                        if (res.ok) {
                          setSelectedWindow(null);

                          fireSuccessConfetti();

                          setToast({
                            isVisible: true,
                            type: "success",
                            title: "🎉 Activity Scheduled!",
                            message: `Successfully scheduled: ${data.title}`,
                            actionLabel: data.placeUrl
                              ? "View Location"
                              : undefined,
                            actionUrl: data.placeUrl || undefined,
                            duration: 6000,
                          });

                          // Refresh the data to show the new activity
                          setTimeout(() => {
                            window.location.reload();
                          }, 2000);
                        } else {
                          setToast({
                            isVisible: true,
                            type: "error",
                            title: "Scheduling Failed",
                            message:
                              data.error ||
                              "Failed to schedule activity. Please try again.",
                            duration: 5000,
                          });
                        }
                      } catch (e) {
                        setToast({
                          isVisible: true,
                          type: "error",
                          title: "Network Error",
                          message:
                            "Please check your connection and try again.",
                          duration: 5000,
                        });
                      } finally {
                        setIsScheduling(false);
                      }
                    }}
                    className={`w-full rounded-lg px-6 py-3 font-medium transition ${
                      selectedWindow && !isScheduling
                        ? "bg-indigo-600 text-white hover:bg-indigo-500"
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
                        Scheduling activity...
                      </span>
                    ) : (
                      "Schedule Selected Time"
                    )}
                  </button>
                  {!selectedWindow && (
                    <p className="mt-2 text-center text-sm text-white/60">
                      Select a green time slot on the calendar to schedule an
                      activity
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right sidebar content */}
            <div className="space-y-6">
              {/* Map */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Locations
                </h3>
                <p className="text-sm text-white/60 mb-4">
                  {locations.length} / {state.members?.length || 0} members
                  shared location
                </p>
                <div className="overflow-hidden rounded-lg border border-white/10">
                  <RoomMap
                    height={250}
                    markers={locations.map((l) => ({
                      lat: l.lat,
                      lon: l.lon,
                      label: l.name || l.email,
                    }))}
                  />
                </div>
              </div>

              {/* Members */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Members
                </h3>
                {state.members && state.members.length > 0 ? (
                  <div className="space-y-3">
                    {state.members.map((m) => (
                      <div
                        key={m.user_email}
                        className="flex items-center gap-3 rounded-lg bg-white/5 p-3"
                      >
                        <div className="h-8 w-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-400">
                            {m.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">
                            {m.user_name}
                          </div>
                          <div className="text-xs text-white/60 truncate">
                            {m.user_email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/60">No members yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
