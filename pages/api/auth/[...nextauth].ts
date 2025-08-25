import NextAuth, {
  type Account,
  type NextAuthOptions,
  type Profile,
  type Session,
  type User,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.readonly",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      // Persist tokens in JWT for the current user session
      if (account) {
        token.accessToken = (
          account as unknown as { access_token?: string }
        )?.access_token;
        token.refreshToken = (
          account as unknown as { refresh_token?: string }
        )?.refresh_token;
        token.expiresAt = (
          account as unknown as { expires_at?: number }
        )?.expires_at;
        token.scope = account.scope;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose limited token info client-side if needed
      (session as Session & { accessToken?: string }).accessToken =
        token.accessToken as string | undefined;
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      try {
        if (!user?.email || !account) return;
        const payload = {
          user_email: user.email,
          provider: account.provider,
          access_token:
            (account as unknown as { access_token?: string })?.access_token ||
            null,
          refresh_token:
            (account as unknown as { refresh_token?: string })?.refresh_token ||
            null,
          expires_at:
            (account as unknown as { expires_at?: number })?.expires_at || null,
          scope: account.scope || null,
          token_type: account.token_type || null,
          updated_at: new Date().toISOString(),
        } as const;
        await supabase.from("user_token").upsert([payload], {
          onConflict: "user_email,provider",
        });
      } catch (e) {
        // Swallow errors to not block sign-in
      }
    },
  },
};

export default NextAuth(authOptions);
