import Link from "next/link";
import { ReactNode } from "react";
import {
  FiLogIn,
  FiLogOut,
  FiCalendar,
  FiMap,
  FiUsers,
  FiSettings,
  FiDollarSign,
} from "react-icons/fi";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useSession();
  const isHome = router.pathname === "/";
  const isAuthenticated = status === "authenticated";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60rem_60rem_at_top_right,rgba(99,102,241,0.08),transparent_60%),radial-gradient(40rem_40rem_at_-10%_120%,rgba(168,85,247,0.06),transparent_60%)]" />

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="group flex items-center gap-3 text-white transition-all duration-200 hover:scale-[1.02]"
            >
              <img
                src="/logo.svg"
                alt="SyncAI"
                className="h-8 w-8 transition-transform group-hover:rotate-3"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-white to-white/90 bg-clip-text">
                SyncAI
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {isAuthenticated && (
                <Link
                  href="/rooms"
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    router.pathname.startsWith("/rooms")
                      ? "bg-white/10 text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/8 hover:scale-[1.02]"
                  }`}
                >
                  <FiCalendar className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Rooms
                  {router.pathname.startsWith("/rooms") && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 -z-10" />
                  )}
                </Link>
              )}
              <Link
                href="/pricing"
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  router.pathname === "/pricing"
                    ? "bg-white/10 text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/8 hover:scale-[1.02]"
                }`}
              >
                <FiDollarSign className="h-4 w-4 transition-transform group-hover:scale-110" />
                Pricing
                {router.pathname === "/pricing" && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 -z-10" />
                )}
              </Link>
              {isAuthenticated && (
                <Link
                  href="/profile"
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    router.pathname === "/profile"
                      ? "bg-white/10 text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/8 hover:scale-[1.02]"
                  }`}
                >
                  <FiSettings className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Profile
                  {router.pathname === "/profile" && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 -z-10" />
                  )}
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="group flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 transition-all duration-200 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] hover:shadow-lg"
                >
                  <FiLogOut className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              ) : (
                <button
                  onClick={() => signIn("google", { callbackUrl: "/rooms" })}
                  className="group relative flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-2 text-sm font-medium text-white transition-all duration-200 hover:from-indigo-500 hover:to-indigo-400 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/25"
                >
                  <FiLogIn className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span>Sign in</span>
                  <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1">{children}</main>

      <footer className="border-t border-white/10 bg-slate-950/50 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="SyncAI" className="h-6 w-6" />
              <span className="text-sm text-white/60">
                © {new Date().getFullYear()} SyncAI. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-white/60 hover:text-white transition"
              >
                Privacy
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-white/60 hover:text-white transition"
              >
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
