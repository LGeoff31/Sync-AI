import Link from "next/link";
import { ReactNode } from "react";
import AuthButtons from "@/components/AuthButtons";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(60rem_60rem_at_top_right,rgba(99,102,241,0.15),transparent_60%),radial-gradient(40rem_40rem_at_-10%_120%,rgba(168,85,247,0.12),transparent_60%)]" />
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-semibold tracking-tight">
          syncAI
        </Link>
        <AuthButtons />
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 px-6 py-8 text-center text-xs text-white/50">
        © {new Date().getFullYear()} syncAI
      </footer>
    </div>
  );
}
