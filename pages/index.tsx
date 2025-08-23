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
    <div className="flex flex-col items-center justify-center h-screen gap-3">
      <h1 className="text-balance text-5xl md:text-6xl font-semibold tracking-tight">
        Plan together, faster
      </h1>
      <p className="text-white/70 text-lg">
        Create a room, invite friends, and sync up on plans in minutes.
      </p>
      <Link
        href="/rooms"
        className="inline-flex h-12 w-40 items-center justify-center gap-3 rounded-full bg-white font-bold text-black transition-transform duration-200 hover:translate-x-3"
      >
        <span>Get started</span>
        <span
          aria-hidden
          className="transition-transform duration-200 group-hover:translate-x-1"
        >
          →
        </span>
      </Link>
    </div>
  );
}
