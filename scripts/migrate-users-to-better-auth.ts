/**
 * One-time migration: Create Better Auth account records for existing users
 * who have passwords in users.password_hash (from old NextAuth setup).
 *
 * Run with: bun --env-file=.env.local scripts/migrate-users-to-better-auth.ts
 */
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../lib/db";
import { accounts, users } from "../lib/schema";

async function migrate() {
  const allUsers = await db.select().from(users);

  for (const user of allUsers) {
    const existing = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, user.id));

    const hasCredentialAccount = existing.some(
      (a) => a.providerId === "credential"
    );

    if (hasCredentialAccount) {
      console.log(`Skip ${user.email} - already has credential account`);
      continue;
    }

    const now = new Date();
    await db.insert(accounts).values({
      id: nanoid(),
      userId: user.id,
      accountId: user.email,
      providerId: "credential",
      password: user.passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`Migrated ${user.email}`);
  }

  console.log("Done.");
}

migrate().catch(console.error);
