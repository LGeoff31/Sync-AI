import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession, signIn } from "next-auth/react";

function NavItem({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  const active = router.pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ring-1 ring-transparent hover:ring-white/10 ${
        active
          ? "bg-white/10 text-white ring-white/10"
          : "text-white/80 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const { status, data } = useSession();
  const user = data?.user;
  return (
    <div className="hidden md:flex md:w-72 md:flex-col md:border-r md:border-white/10 md:bg-white/5 h-screen">
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name || "avatar"}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-white/10" />
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">
              {user?.name || "Guest"}
            </div>
            <div className="truncate text-xs text-white/60">
              {user?.email || "Not signed in"}
            </div>
          </div>
        </div>
        {status !== "authenticated" && (
          <button
            onClick={() => signIn("google")}
            className="mt-3 w-full rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-indigo-400 transition"
          >
            Sign in
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-white/50">
          Navigation
        </div>
        <div className="space-y-1">
          <NavItem href="/rooms" label="Rooms" />
          <NavItem href="/profile" label="Profile" />
        </div>
      </nav>

      {status === "authenticated" && (
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => signOut()}
            className="w-full rounded-md bg-white/5 px-3 py-2 text-sm font-medium text-white/90 ring-1 ring-white/10 hover:bg-white/10 transition"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
