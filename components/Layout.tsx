import Link from "next/link";
import { ReactNode } from "react";
import { useSession } from "next-auth/react";
// removed header auth buttons; handled in Sidebar
import Sidebar from "@/components/Sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  const { status } = useSession();
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(60rem_60rem_at_top_right,rgba(99,102,241,0.15),transparent_60%),radial-gradient(40rem_40rem_at_-10%_120%,rgba(168,85,247,0.12),transparent_60%)]" />
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="syncAI" className="h-7 w-7" />
          <span className="text-2xl font-semibold tracking-tight">syncAI</span>
        </Link>
      </header>

      <div className="relative z-10 flex flex-1">
        {status === "authenticated" && <Sidebar />}
        <main className="flex-1">{children}</main>
      </div>

      <footer className="relative z-10 px-6 py-8 text-center text-xs text-white/50">
        © {new Date().getFullYear()} syncAI
      </footer>
    </div>
  );
}
