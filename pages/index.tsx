import Link from "next/link";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Home() {
  const { status } = useSession();
  useEffect(() => {
    if (status === "authenticated") {
      window.location.href = "/rooms";
    }
  }, [status]);
  return (
    <div className="px-6 py-16">
      <section className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center text-center space-y-8">
        <h1 className="text-balance text-5xl md:text-6xl font-semibold tracking-tight">
          Plan together, faster
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Create a room, invite friends, and sync up on plans in minutes.
        </p>
        <Link
          href="/rooms/new"
          className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-md bg-indigo-500 px-6 font-medium text-slate-900 hover:bg-indigo-400 transition"
        >
          Get started
        </Link>
      </section>
    </div>
  );
}
