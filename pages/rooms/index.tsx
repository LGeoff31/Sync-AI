import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { FaPlus } from "react-icons/fa";

type Room = { code: string; name: string; created_at: string };

export default function RoomsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [state, setState] = useState<{
    loading: boolean;
    rooms: Room[];
    error?: string;
  }>({
    loading: true,
    rooms: [],
  });
  const [joinCode, setJoinCode] = useState("");
  const isValid = /^[A-Z0-9]{6,8}$/.test(joinCode.trim());
  const onJoin = () => {
    const code = joinCode.trim();
    if (!/^[A-Z0-9]{6,8}$/.test(code)) return;
    router.push(`/rooms/${code}`);
  };

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
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Rooms</h1>
          <p className="mt-2 text-white/70">
            Please sign in to see your rooms and join rooms.
          </p>
          <button
            onClick={() => signIn("google")}
            className="mt-4 rounded-md bg-indigo-500 px-4 py-2 font-medium text-slate-900 hover:bg-indigo-400 transition"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Rooms</h1>
          <p className="mt-2 text-white/60">
            Manage and join collaboration rooms
          </p>
        </div>
        <Link
          href="/rooms/new"
          className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500 transition inline-flex items-center gap-2"
        >
          <FaPlus className="h-4 w-4" />
          <span>Create Room</span>
        </Link>
      </div>

      <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
        <h2 className="text-lg font-medium">Join a room</h2>
        <p className="mt-1 text-sm text-white/70">
          Have a code? Enter it below.
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1 h-12 rounded-md bg-slate-900/60 ring-1 ring-white/10 px-2 flex items-center gap-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && onJoin()}
              placeholder="ENTER CODE"
              className="bg-transparent outline-none uppercase tracking-widest px-2 w-full h-full placeholder:text-white/30 text-white"
            />
          </div>
          <button
            onClick={onJoin}
            disabled={!isValid}
            className={`h-12 whitespace-nowrap rounded-md px-5 font-medium transition ${
              isValid
                ? "bg-purple-400 text-slate-900 hover:bg-purple-300"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            Join
          </button>
        </div>
        {!isValid && joinCode.length > 0 && (
          <p className="mt-2 text-xs text-white/60">
            Code must be 6–8 letters/numbers
          </p>
        )}
      </section>

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
