import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { desc, eq } from "drizzle-orm";
import { leads, users } from "@/lib/schema";

export interface Profile {
  id: string;
  name: string;
  plan: "free" | "pro";
  credits: number;
  email: string;
}

export interface Lead {
  name?: string;
  email?: string;
  company?: string;
}

const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const sql = globalForDb.sql ?? postgres(databaseUrl, { prepare: false });
if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}

export const db = drizzle(sql);

export async function getProfileById(id: string): Promise<Profile | null> {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      plan: users.plan,
      credits: users.credits,
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
