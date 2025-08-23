import { useSession, signIn } from "next-auth/react";

export default function ProfilePage() {
  const { status, data } = useSession();

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
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="mt-4 space-y-2">
        <div className="text-white/80">
          Name: {data.user?.name || "Anonymous"}
        </div>
        <div className="text-white/80">Email: {data.user?.email || "N/A"}</div>
      </div>
    </div>
  );
}
