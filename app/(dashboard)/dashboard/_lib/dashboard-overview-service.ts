import { getSession } from "@/auth";
import { getDashboardData } from "@/app/(dashboard)/dashboard/_lib/get-dashboard-data";
import { getProfileById } from "@/lib/db";
import { db } from "@/lib/db";
import { agentLeads } from "@/lib/schema";
import { and, count, eq, gte } from "drizzle-orm";

const MODEL_LABELS: Record<string, string> = {
  "moonshotai/Kimi-K2.5": "Kimi K2.5",
  "MiniMaxAI/MiniMax-M2.1": "MiniMax M2.1",
  "zai-org/GLM-4.7-FP8": "GLM 4.7",
  "openai/gpt-oss-120b": "GPT-OSS 120B",
};

export async function getDashboardOverviewData() {
  const session = await getSession();
  if (!session?.user?.id) return { session: null };

  const [data, profile] = await Promise.all([getDashboardData(), getProfileById(session.user.id)]);
  if (!data) return { session, data: null, profile };

  const { portfolio, agent } = data;
  const [totalLeadsResult] = await db.select({ count: count() }).from(agentLeads).where(eq(agentLeads.portfolioId, portfolio.id));

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [newLeadsResult] = await db
    .select({ count: count() })
    .from(agentLeads)
    .where(and(eq(agentLeads.portfolioId, portfolio.id), gte(agentLeads.createdAt, sevenDaysAgo)));

  return {
    session,
    profile,
    data,
    hasContent: Boolean(portfolio.content),
    totalLeads: totalLeadsResult.count,
    newLeads: newLeadsResult.count,
    modelLabel: agent ? MODEL_LABELS[agent.model] || agent.model : "Not configured",
    portfolioLink: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/${portfolio.handle}`,
  };
}
