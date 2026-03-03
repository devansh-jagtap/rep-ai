import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getActivePortfolio } from "@/lib/active-portfolio";
import { getAgentByPortfolioId, getAgentByUserId } from "@/lib/agent/configure";
import { getSession } from "@/auth";

async function requireAuthUserId() {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getDashboardData() {
  const userId = await requireAuthUserId();

  const profile = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  const portfolio = await getActivePortfolio(userId);

  if (!portfolio) {
    const agent = await getAgentByUserId(userId);
    return { portfolio: null, agent, plan: profile?.plan ?? "free" };
  }

  const portfolioAgent = await getAgentByPortfolioId(portfolio.id);
  const agent = portfolioAgent ?? (await getAgentByUserId(userId));
  return { portfolio, agent, plan: profile?.plan ?? "free" };
}
