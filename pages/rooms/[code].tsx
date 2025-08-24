import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import copy from "copy-to-clipboard";

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
        className="rounded-md bg-indigo-500 px-3 py-2 font-medium text-slate-900 hover:bg-indigo-400 transition"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

export default function RoomPage() {
  const router = useRouter();
  const { code } = router.query as { code?: string };
  const [state, setState] = useState<{
    loading: boolean;
    name?: string;
    error?: string;
    members?: { user_email: string; user_name: string; joined_at: string }[];
  }>({ loading: true });

  useEffect(() => {
    if (!code) return;
    (async () => {
      const res = await fetch(`/api/rooms/${code}`);
      const data = await res.json();
      if (!res.ok) {
        setState({ loading: false, error: data.error || "Room not found" });
        return;
      }
      // attempt to join as member (no-op if already joined or unauthenticated)
      try {
        await fetch(`/api/rooms/${code}/members`, { method: "POST" });
      } catch {}
      // fetch members after join
      const resM = await fetch(`/api/rooms/${code}/members`);
      const dataM = await resM.json();
      setState({
        loading: false,
        name: data.room.name,
        members: dataM.members || [],
      });
    })();
  }, [code]);

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-white/70 hover:text-white underline-offset-4 hover:underline"
          >
            Home
          </Link>
          <code className="rounded bg-slate-900/60 px-2 py-1 text-white ring-1 ring-white/10">
            {code}
          </code>
        </div>
        {state.loading && <p className="text-white/80">Loading...</p>}
        {state.error && <p className="text-red-400">{state.error}</p>}
        {!state.loading && !state.error && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <h1 className="text-2xl font-semibold">
              {state.name || "Untitled room"}
            </h1>
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
          </div>
        )}
      </div>
    </div>
  );
}
