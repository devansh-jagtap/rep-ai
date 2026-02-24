import { headers } from "next/headers";
import { compare, hash } from "bcryptjs";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { toNextJsHandler } from "better-auth/next-js";
import { db } from "@/lib/db";
import { users, sessions, accounts, verifications } from "@/lib/schema";

const authInstance = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      hash: async (password) => hash(password, 12),
      verify: async ({ hash: storedHash, password }) => compare(password, storedHash),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
    modelName: "sessions",
    fields: {
      token: "session_token",
      userId: "user_id",
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
    },
  },
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || ["http://localhost:3000"],
  secret: process.env.AUTH_SECRET,
  plugins: [nextCookies()],
});

export const handlers = toNextJsHandler(authInstance);
export const signIn = authInstance.api.signInEmail;
export const signOut = authInstance.api.signOut;
export { authInstance };

export async function auth() {
  try {
    const session = await authInstance.api.getSession({
      headers: await headers(),
    });

    if (!session) return null;

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
      expires: session.session.expiresAt.toISOString(),
    };
  } catch {
    return null;
  }
}
