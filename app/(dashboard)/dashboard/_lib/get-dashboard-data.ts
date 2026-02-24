import { auth } from "@/auth";
import { getPortfolioByUserId } from "@/lib/db/portfolio";
import { getAgentByPortfolioId } from "@/lib/agent/configure";

async function requireAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getDashboardData() {
  const userId = await requireAuthUserId();

  const portfolio = await getPortfolioByUserId(userId);
  if (!portfolio) return null;

  const agent = await getAgentByPortfolioId(portfolio.id);
  return { portfolio, agent };
}
