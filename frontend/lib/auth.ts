import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

// These callbacks run on the SERVER, so they need a URL the Next.js server can
// reach the backend at. Prefer a server-only API_URL (useful when the frontend
// talks to the backend over an internal URL) and fall back to the public one.
// We deliberately do NOT fall back to localhost in production: a missing URL
// must fail loudly instead of silently hitting a host that isn't there in prod.
const API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:5000");

if (!API_URL) {
  console.error(
    "[auth] No API_URL / NEXT_PUBLIC_API_URL configured — backend auth calls will fail."
  );
}

// Single client for all backend auth calls. The timeout matters in production:
// a cold-starting backend that never responds would otherwise hang the login.
const backend = axios.create({
  baseURL: `${API_URL}/api/auth`,
  timeout: 15000,
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  debug: process.env.NODE_ENV !== "production",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { data } = await backend.post("/login", {
            email: credentials?.email,
            password: credentials?.password,
          });
          // Carry the backend JWT through NextAuth callbacks.
          return { ...data.user, id: data.user._id, backendToken: data.token };
        } catch (err: any) {
          console.error(
            "[auth] credentials login failed:",
            err?.response?.data || err?.message
          );
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Credentials users were already validated in `authorize`.
      if (account?.provider !== "google") return true;

      // Google sign-in: upsert the user in MongoDB and capture our backend JWT.
      try {
        const { data } = await backend.post("/oauth", {
          name: user.name,
          email: user.email,
          avatar: user.image,
        });
        (user as any).backendToken = data.token;
        (user as any)._id = data.user._id;
        return true;
      } catch (err: any) {
        // Log the real reason so production failures are debuggable instead of
        // surfacing as a generic "AccessDenied" with no explanation.
        console.error(
          "[auth] Google OAuth upsert failed:",
          err?.response?.status,
          err?.response?.data || err?.message
        );
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.backendToken = (user as any).backendToken;
        token.userId = (user as any)._id;
      }
      return token;
    },
    async session({ session, token }) {
      // The app authenticates backend requests with this token (see lib/api.ts),
      // and reads session.user.id, so both must be present on every session.
      (session as any).backendToken = token.backendToken;
      (session.user as any).id = token.userId;
      return session;
    },
  },
};
