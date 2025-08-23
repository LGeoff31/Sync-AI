import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function NewRoomPage() {
  const { status } = useSession();
  const [name, setName] = useState("");
  const router = useRouter();

  if (status === "loading")
    return <div className="p-6 text-white/80">Checking session...</div>;
  if (status !== "authenticated")
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-semibold">Create a room</h1>
          <p className="text-white/70">Please sign in to continue.</p>
          <button
            onClick={() => signIn("google")}
            className="inline-flex items-center justify-center rounded-md bg-indigo-500 px-4 py-2 font-medium text-slate-900 hover:bg-indigo-400 transition"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );

  const create = async () => {
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok) router.push(`/rooms/${data.room.code}`);
    else alert(data.error || "Failed");
  };

  return (
    <div className="px-6 py-16">
      <div className="mx-auto w-full max-w-lg rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
        <h1 className="text-2xl font-semibold">Create a room</h1>
        <p className="mt-1 text-sm text-white/70">
          Give your room a friendly name.
        </p>
        <div className="mt-6 space-y-3">
          <label className="block text-sm text-white/80">Room name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Friday Dinner Plans"
            className="w-full rounded-md bg-slate-900/60 px-3 py-2 text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-indigo-400/40"
          />
          <button
            onClick={create}
            className="mt-4 w-full rounded-md bg-indigo-500 px-4 py-2 font-medium text-slate-900 hover:bg-indigo-400 transition"
          >
            Create room
          </button>
        </div>
      </div>
    </div>
  );
}
