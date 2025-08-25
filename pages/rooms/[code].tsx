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
            <RoomCalendar data={state.calendar} />

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
                  onClick={async () => {
                    if (!state.free || state.free.length === 0)
                      return alert("No free window available");
                    const best = state.free[0];
                    const res = await fetch(`/api/rooms/${code}/schedule`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ window: best }),
                    });
                    const data = await res.json();
                    if (res.ok)
                      alert(
                        `Scheduled: ${data.title}${
                          data.placeUrl ? `\n${data.placeUrl}` : ""
                        }`
                      );
                    else alert(data.error || "Failed to schedule");
                  }}
                  className="w-full rounded-md bg-emerald-500 px-4 py-2 font-medium text-slate-900 hover:bg-emerald-400 transition"
                >
                  Auto-schedule with AI
                </button>
              </div>

              <div className="mt-3">
                <button
                  onClick={() => {
                    if (!("geolocation" in navigator))
                      return alert("Geolocation not supported");
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        const { latitude, longitude } = pos.coords;
                        const r = await fetch(`/api/user/location`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            lat: latitude,
                            lon: longitude,
                          }),
                        });
                        if (r.ok) alert("Location saved");
                        else alert("Failed to save location");
                      },
                      (err) => alert("Location error: " + err.message),
                      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
                    );
                  }}
                  className="w-full rounded-md bg-indigo-500 px-4 py-2 font-medium text-slate-900 hover:bg-indigo-400 transition"
                >
                  Share my location
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
