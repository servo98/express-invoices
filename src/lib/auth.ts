import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  debug: true,
  providers: [
    Discord({
      checks: ["state"],
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      token: {
        url: "https://discord.com/api/oauth2/token",
        async conform(response: Response) {
          if (!response.ok) {
            const text = await response.clone().text();
            console.error(`[auth][discord] Token error: HTTP ${response.status}`, text.slice(0, 500));
          }
          return undefined;
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
