import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { desc, eq } from "drizzle-orm";
import * as schema from "@/lib/schema";
import { leads, users } from "@/lib/schema";

export interface Profile {
  id: string;
  name: string;
  plan: "free" | "pro";
  credits: number;
  email: string;
  image?: string | null;
}

export interface Lead {
  name?: string;
  email?: string;
  company?: string;
}

const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

const databaseUrl = process.env.DATABASE_URL ?? "postgres://postgres:postgres@127.0.0.1:5432/postgres";

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production") {
  console.warn("DATABASE_URL is not set; using fallback local connection string for build/dev checks.");
}

const sql = globalForDb.sql ?? postgres(databaseUrl, {
  prepare: false,
  ssl: "require",
  connect_timeout: 30,
  idle_timeout: 20,    // 20s: long enough to reuse connections, short enough to avoid stale pooler sockets
  max_lifetime: 60 * 5, // 5 minutes
  onnotice: () => { }, // Silence notices
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}

export const db = drizzle(sql, { schema });

/**
 * Executes a database operation with retry logic for transient errors.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 100
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      // Retry on ECONNRESET or other transient Postgres errors
      const isTransient =
        error?.code === 'ECONNRESET' ||
        error?.code === 'CONNECT_TIMEOUT' ||
        error?.cause?.code === 'CONNECT_TIMEOUT' ||
        error?.message?.includes('ECONNRESET') ||
        error?.message?.includes('read ECONNRESET') ||
        error?.message?.includes('CONNECT_TIMEOUT') ||
        error?.severity === 'FATAL'; // Often indicates connection lost

      if (!isTransient || i === maxRetries - 1) {
        throw error;
      }

      console.warn(`Database query failed (attempt ${i + 1}/${maxRetries}). Retrying in ${delay}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  throw lastError;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      plan: users.plan,
      credits: users.credits,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) {
    return null;
  }

  return {
    ...user,
    name: user.name ?? "User",
    plan: user.plan as "free" | "pro",
  };
}

export async function saveLead(
  lead: Required<Pick<Lead, "email">> & Lead,
  userId: string
): Promise<void> {
  await db.insert(leads).values({
    id: crypto.randomUUID(),
    email: lead.email,
    name: lead.name ?? null,
    company: lead.company ?? null,
    userId,
  });
}

export async function getLeads(userId: string) {
  return db
    .select()
    .from(leads)
    .where(eq(leads.userId, userId))
    .orderBy(desc(leads.createdAt));
}
