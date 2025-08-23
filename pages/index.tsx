import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const router = useRouter();

  const isValid = /^[A-Z0-9]{6,8}$/.test(joinCode.trim());

  const onJoin = () => {
    const code = joinCode.trim();
    if (!isValid) return;
    router.push(`/rooms/${code}`);
  };

  return (
    <div className="px-6 py-16">
      <section className="mx-auto flex min-h-[60vh] w-full flex-col items-center justify-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-white/70">Plan together, faster</span>
        </div>
        <h1 className="text-balance text-5xl md:text-6xl font-semibold tracking-tight">
          Taking the trouble out of planning together
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Find times that work for the group and get ideas for what to do.
          Create a room, invite friends, and sync up.
        </p>

        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-4 py-4 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/rooms/new"
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-md bg-indigo-500 px-5 font-medium text-slate-900 hover:bg-indigo-400 transition"
            >
              Create a room
            </Link>
            <div className="flex-1 h-12 rounded-md bg-slate-900/60 ring-1 ring-white/10 px-2 flex items-center gap-2">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && onJoin()}
                placeholder="ENTER CODE"
                className="bg-transparent outline-none uppercase tracking-widest px-2 w-full h-full placeholder:text-white/30 text-white"
              />
              <button
                onClick={onJoin}
                disabled={!isValid}
                className={`h-12 whitespace-nowrap rounded-md px-4 font-medium transition ${
                  isValid
                    ? "bg-purple-400 text-slate-900 hover:bg-purple-300"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                }`}
              >
                Enter a room
              </button>
            </div>
          </div>
          {!isValid && (
            <p className="mt-2 text-left text-xs text-white/50">
              Code must be 6–8 letters/numbers
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto mt-20 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="font-medium">Create</h3>
          <p className="text-sm text-white/70">Spin up a room in seconds.</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="font-medium">Invite</h3>
          <p className="text-sm text-white/70">Share a code or a link.</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="font-medium">Sync</h3>
          <p className="text-sm text-white/70">Finalize plans together.</p>
        </div>
      </section>
    </div>
  );
}
