import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "../_lib/get-dashboard-data";
import { AgentClient } from "./agent-client";

export default async function AgentPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");

  const data = await getDashboardData();
  if (!data) redirect("/onboarding");

  return (
    <AgentClient
      agent={data.agent}
      agentId={data.agent?.id ?? null}
      portfolioHandle={data.portfolio.handle}
      hasContent={!!data.portfolio.content}
      isPortfolioPublished={data.portfolio.isPublished}
    />
  );
}
