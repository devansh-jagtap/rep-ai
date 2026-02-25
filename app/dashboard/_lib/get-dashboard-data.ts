import { getSession } from "@/auth";
import { getActivePortfolio } from "@/lib/active-portfolio";
import { getAgentByPortfolioId } from "@/lib/agent/configure";

async function requireAuthUserId() {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getDashboardData() {
  const userId = await requireAuthUserId();

  const portfolio = await getActivePortfolio(userId);
  if (!portfolio) return null;

  const agent = await getAgentByPortfolioId(portfolio.id);
  return { portfolio, agent };
}
