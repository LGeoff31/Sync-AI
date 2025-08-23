import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { status, data } = useSession();
  return (
    <div className="flex items-center justify-center gap-3">
      {status === "authenticated" ? (
        <>
          {data?.user?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.user.image}
              alt={data.user.name || "avatar"}
              className="h-8 w-8 rounded-full border border-white/20"
            />
          )}
          <button
            onClick={() => signOut()}
            className="text-sm font-medium text-white/80 hover:text-white transition"
          >
            Sign out
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="text-sm font-medium text-white/80 hover:text-white transition"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}

export default AuthButtons;
