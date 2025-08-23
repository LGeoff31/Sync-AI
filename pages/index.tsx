import { signIn, signOut, useSession } from "next-auth/react";

function AuthButtons() {
  const { status, data } = useSession();
  console.log(data);
  return (
    <div className="flex items-center justify-center gap-3">
      {status === "authenticated" ? (
        <button onClick={() => signOut()} className="underline text-sm">
          Sign out
        </button>
      ) : (
        <button onClick={() => signIn("google")} className="underline text-sm">
          Sign in with Google
        </button>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight">
          Sync plans with your closest friends
        </h1>
        <p className="text-gray-600">
          Connect calendars, find the best times for everyone, and get AI
          recommendations for what to do together.
        </p>
        <AuthButtons />
        <div className="flex items-center justify-center gap-3">
          <a href="#" className="bg-black text-white px-5 py-2 rounded-md">
            Get started
          </a>
          <a href="#learn-more" className="text-gray-800 underline">
            Learn more
          </a>
        </div>
      </div>
    </main>
  );
}
