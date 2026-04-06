import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

/**
 * Custom token exchange for Discord.
 * Bypasses oauth4webapi's strict response validation which fails on
 * non-200 responses (rate limits, etc). Sends credentials in POST body
 * (client_secret_post) as Discord requires.
 * Retries on 429 rate limits.
 */
async function discordTokenRequest(code: string, redirectUri: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: process.env.AUTH_DISCORD_ID!,
    client_secret: process.env.AUTH_DISCORD_SECRET!,
  });

  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (response.ok) {
      return await response.json();
    }

    if (response.status === 429 && attempt < maxRetries - 1) {
      const retryAfter = response.headers.get("retry-after");
      const waitMs = retryAfter ? Number(retryAfter) * 1000 : 3000;
      console.warn(
        `[auth][discord] Rate limited (attempt ${attempt + 1}/${maxRetries}), retrying in ${waitMs}ms`
      );
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    const text = await response.text();
    console.error(
      `[auth][discord] Token exchange failed: HTTP ${response.status}`,
      text.slice(0, 500)
    );
    throw new Error(`Discord token exchange failed: HTTP ${response.status}`);
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  debug: process.env.NODE_ENV === "development",
  providers: [
    Discord({
      checks: ["state"],
      token: {
        url: "https://discord.com/api/oauth2/token",
        async request({ params, provider }: { params: URLSearchParams; provider: { callbackUrl: string } }) {
          const tokens = await discordTokenRequest(
            params.get("code")!,
            provider.callbackUrl
          );
          return { tokens };
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
