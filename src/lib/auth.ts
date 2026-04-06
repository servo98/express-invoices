import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { customFetch } from "@auth/core";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

/** Wraps fetch with retry-on-429 for Discord API rate limits. */
async function fetchWithRetry(
  ...args: Parameters<typeof fetch>
): ReturnType<typeof fetch> {
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(...args);
    if (response.status !== 429 || attempt === maxRetries - 1) {
      if (!response.ok) {
        console.error(
          `[auth][discord] HTTP ${response.status} from ${typeof args[0] === "string" ? args[0] : "request"}`
        );
      }
      return response;
    }
    const retryAfter = response.headers.get("retry-after");
    const waitMs = retryAfter ? Number(retryAfter) * 1000 : 3000;
    console.warn(
      `[auth][discord] Rate limited (attempt ${attempt + 1}/${maxRetries}), retrying in ${waitMs}ms`
    );
    await new Promise((r) => setTimeout(r, waitMs));
  }
  return fetch(...args);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  debug: process.env.NODE_ENV === "development",
  providers: [
    Discord({
      checks: ["state"],
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      [customFetch]: fetchWithRetry,
    } as any),
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
