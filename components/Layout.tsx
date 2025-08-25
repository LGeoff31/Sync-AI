import Link from "next/link";
import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const showSidebar =
    router.pathname.startsWith("/rooms") ||
    router.pathname.startsWith("/profile");
  return (
    <div className="flex flex-col">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(60rem_60rem_at_top_right,rgba(99,102,241,0.15),transparent_60%),radial-gradient(40rem_40rem_at_-10%_120%,rgba(168,85,247,0.12),transparent_60%)]" />
      <div className="absolute top-4 left-4 z-10 pointer-events-auto flex-row flex items-center gap-2">
        <img src="/logo.svg" alt="syncAI" className="h-10 w-10" />
        <span className="text-white text-2xl font-bold">SyncAI</span>
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
