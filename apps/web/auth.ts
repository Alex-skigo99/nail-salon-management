import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { User } from "./types/userTypes";
import { apiRoutes } from "./const/apiRouts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // ─── Email + Password ──────────────────────────
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${API_URL}${apiRoutes.auth.login}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          if (!res.ok) return null;

          const data = await res.json();
          return {
            id: String(data.user.id),
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone,
            image: data.user.image,
            role: data.user.role,
            accessToken: data.token,
          };
        } catch {
          return null;
        }
      },
    }),

    // ─── Google OAuth ──────────────────────────────
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/login",
    newUser: "/signup",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  callbacks: {
    // ─── Handle Google sign-in: register/link user in our DB ───
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const res = await fetch(`${API_URL}${apiRoutes.auth.google}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              googleId: account.providerAccountId,
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          });

          if (!res.ok) return false;

          const data = await res.json();
          // Attach DB user data to the user object for the jwt callback
          user.id = String(data.user.id);
          user.role = data.user.role;
          user.phone = data.user.phone;
          user.accessToken = data.token;

          return true;
        } catch {
          return false;
        }
      }
      return true;
    },

    // ─── Persist custom fields in the JWT ──────────
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.accessToken = user.accessToken;
      }
      if (trigger === "update" && session?.image !== undefined) {
        token.picture = session.image;
      }
      return token;
    },

    // ─── Expose custom fields in the session ───────
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as User["id"];
        session.user.role = token.role as User["role"];
        session.user.phone = token.phone as User["phone"];
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
});
