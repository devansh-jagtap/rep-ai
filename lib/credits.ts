import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

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
