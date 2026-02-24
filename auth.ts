import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { decode } from "@auth/core/jwt";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/schema";

const SESSION_COOKIE = "authjs.session-token";
const SECURE_SESSION_COOKIE = "__Secure-authjs.session-token";

const nextAuth = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "").toLowerCase().trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) {
          return null;
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user || !(await compare(password, user.passwordHash))) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
});

export const { handlers, signIn, signOut } = nextAuth;

/**
 * Drop-in replacement for nextAuth.auth() that reads the JWT session
 * directly from cookies, bypassing @auth/core's Auth() → toResponse()
 * chain which creates Response objects that break on Node 24's stricter
 * undici extractBody assertions.
 */
export async function auth() {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get(SESSION_COOKIE)?.value ??
      cookieStore.get(SECURE_SESSION_COOKIE)?.value;

    if (!token) return null;

    const secret = process.env.AUTH_SECRET;
    if (!secret) return null;

    const decoded = await decode({ token, secret, salt: SESSION_COOKIE });
    if (!decoded) return null;

    return {
      user: {
        id: (decoded.id as string) ?? decoded.sub ?? "",
        name: (decoded.name as string) ?? null,
        email: (decoded.email as string) ?? null,
        image: (decoded.picture as string) ?? null,
      },
      expires: decoded.exp
        ? new Date(decoded.exp * 1000).toISOString()
        : "",
    };
  } catch {
    return null;
  }
}
