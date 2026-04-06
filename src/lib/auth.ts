import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

/** Wraps global fetch with retry-on-429 for Discord API rate limits. */
async function fetchWithRetry(
  url: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, init);
    if (response.status !== 429 || attempt === maxRetries - 1) {
      return response;
    }
    const retryAfter = response.headers.get("retry-after");
    const waitMs = retryAfter ? Number(retryAfter) * 1000 : 3000;
    console.warn(
      `[auth][discord] Rate limited (attempt ${attempt + 1}/${maxRetries}), retrying in ${waitMs}ms`
    );
    await new Promise((r) => setTimeout(r, waitMs));
  }
  // Unreachable, but TypeScript needs it
  return fetch(url, init);
}

const discordProvider = Discord({
  checks: ["state"],
  client: {
    token_endpoint_auth_method: "client_secret_post",
  },
});

// Inject custom fetch with retry logic for Discord's rate limits
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(discordProvider as any)[Symbol.for("customFetch")] = fetchWithRetry;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  debug: process.env.NODE_ENV === "development",
  providers: [discordProvider],
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
