import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { status, data } = useSession();
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    (async () => {
      if (status !== "authenticated") return;
      const r = await fetch("/api/user/profile");
      const j = await r.json();
      if (r.ok && j.profile?.bio) setBio(j.profile.bio as string);
    })();
  }, [status]);

  if (status === "loading") return <div className="p-6">Loading profile…</div>;
  if (status !== "authenticated")
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-white/70">Sign in to view your profile.</p>
        <button
          onClick={() => signIn("google")}
          className="mt-4 rounded-md bg-indigo-500 px-4 py-2 font-medium text-slate-900 hover:bg-indigo-400 transition"
        >
          Sign in with Google
        </button>
      </div>
    );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profile</h1>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-white/10 bg-white/5 p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">About you</h2>
              <p className="mt-1 text-sm text-white/70">
                Share a short description so friends know it’s you.
              </p>
            </div>
            {!editing && (
              <button
                onClick={() => {
                  setEditing(true);
                  setSaved(false);
                }}
                className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-indigo-400 transition"
              >
                Edit
              </button>
            )}
          </div>

          {!editing && (
            <div className="mt-4 rounded-md border border-white/10 bg-slate-900/40 p-4 text-white/80 whitespace-pre-wrap min-h-[96px]">
              {bio?.trim().length ? bio : "No description yet."}
            </div>
          )}

          {editing && (
            <>
              <textarea
                rows={6}
                placeholder="Write a brief description..."
                className="mt-4 w-full resize-none rounded-md bg-slate-900/60 px-3 py-2 text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-indigo-400/40"
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  setSaved(false);
                }}
              />
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const r = await fetch("/api/user/profile", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ bio }),
                    });
                    if (r.ok) {
                      setSaved(true);
                      setEditing(false);
                    }
                  }}
                  className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-indigo-400 transition"
                >
                  Save
                </button>
              </div>
              {saved && (
                <div className="mt-2 text-xs text-emerald-400">Saved</div>
              )}
            </>
          )}
        </section>

        <aside className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-medium">Your info</h2>
          <div className="mt-3 space-y-2 text-white/80">
            <div>Name: {data.user?.name || "Anonymous"}</div>
            <div>Email: {data.user?.email || "N/A"}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
