import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

export async function getCredits(userId: string): Promise<number> {
  const [user] = await db
    .select({ credits: users.credits })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.credits ?? 0;
}

export async function consumeCredits(
  userId: string,
  amount: number
): Promise<boolean> {
  if (amount <= 0) {
    return false;
  }

  const updated = await db
    .update(users)
    .set({
      credits: sql`${users.credits} - ${amount}`,
    })
    .where(and(eq(users.id, userId), gte(users.credits, amount)))
    .returning({ id: users.id });

  return updated.length > 0;
}
