import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";

type Room = { code: string; name: string; created_at: string };

export default function RoomsPage() {
  const { status } = useSession();
  const [state, setState] = useState<{
    loading: boolean;
    rooms: Room[];
    error?: string;
  }>({
    loading: true,
    rooms: [],
  });

  useEffect(() => {
    if (status !== "authenticated") {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    (async () => {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      if (res.ok) setState({ loading: false, rooms: data.rooms });
      else
        setState({
          loading: false,
          rooms: [],
          error: data.error || "Failed to load rooms",
        });
    })();
  }, [status]);

  if (status === "loading") return <div className="p-6">Loading…</div>;

  if (status !== "authenticated") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Rooms</h1>
        <p className="mt-2 text-white/70">Please sign in to see your rooms.</p>
        <button
          onClick={() => signIn("google")}
          className="mt-4 rounded-md bg-indigo-500 px-4 py-2 font-medium text-slate-900 hover:bg-indigo-400 transition"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your rooms</h1>
        <Link
          href="/rooms/new"
          className="rounded-md bg-indigo-500 px-4 py-2 font-medium text-slate-900 hover:bg-indigo-400 transition"
        >
          New room
        </Link>
      </div>

      {state.loading && <p className="mt-6">Loading…</p>}
      {state.error && <p className="mt-6 text-red-400">{state.error}</p>}
      {!state.loading && !state.error && (
        <ul className="mt-6 divide-y divide-white/10 rounded-lg border border-white/10 bg-white/5">
          {state.rooms.length === 0 && (
            <li className="px-4 py-6 text-white/70">
              No rooms yet. Create your first one.
            </li>
          )}
          {state.rooms.map((r) => (
            <li
              key={r.code}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <div className="font-medium">{r.name || "Untitled"}</div>
                <div className="text-xs text-white/60">{r.code}</div>
              </div>
              <Link
                href={`/rooms/${r.code}`}
                className="text-sm text-indigo-300 hover:text-indigo-200"
              >
                Open →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
