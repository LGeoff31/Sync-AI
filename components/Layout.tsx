import Link from "next/link";
import { ReactNode } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useSession();
  const showSidebar =
    router.pathname.startsWith("/rooms") ||
    router.pathname.startsWith("/profile") ||
    router.pathname.startsWith("/pricing") ||
    router.pathname.startsWith("/demo");
  const isHome = router.pathname === "/";
  const isRooms = router.pathname.startsWith("/rooms");
  return (
    <div className="flex flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60rem_60rem_at_top_right,rgba(99,102,241,0.15),transparent_60%),radial-gradient(40rem_40rem_at_-10%_120%,rgba(168,85,247,0.12),transparent_60%)]" />
      <Link
        href="/"
        aria-label="Go to homepage"
        className="absolute top-4 left-4 z-50 pointer-events-auto flex-row flex items-center gap-2 cursor-pointer"
      >
        <img src="/logo.svg" alt="syncAI" className="h-10 w-10" />
        <span className="text-white text-2xl font-bold">SyncAI</span>
      </Link>

      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        {isHome ? (
          status === "authenticated" ? (
            <Link
              href="/rooms"
              className="rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90"
            >
              Dashboard
            </Link>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/20 cursor-pointer"
            >
              Sign in
            </button>
          )
        ) : null}
      </div>

      <div className="relative z-10 flex flex-1">
        {showSidebar && <Sidebar />}
        <main className="flex-1">{children}</main>
      </div>
      <footer className="text-center text-xs text-white/50 absolute bottom-0 left-1/2 -translate-x-1/2">
        © {new Date().getFullYear()} SyncAI
      </footer>
    </div>
  );
}
