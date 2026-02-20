import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "../actions";
import { AgentClient } from "./agent-client";

export default async function AgentPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const data = await getDashboardData();
  if (!data) redirect("/onboarding");

  return (
    <AgentClient
      agent={data.agent}
      portfolioHandle={data.portfolio.handle}
      hasContent={!!data.portfolio.content}
    />
  );
}
