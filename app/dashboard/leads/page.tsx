import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "../actions";
import { LeadsClient } from "./leads-client";
import { db } from "@/lib/db";
import { agentLeads } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const data = await getDashboardData();
  if (!data) redirect("/onboarding");

  const fetchedLeads = await db
    .select()
    .from(agentLeads)
    .where(eq(agentLeads.portfolioId, data.portfolio.id))
    .orderBy(desc(agentLeads.createdAt));

  const formattedLeads = fetchedLeads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    budget: lead.budget,
    confidence: lead.confidence,
    date: lead.createdAt.toISOString().split("T")[0],
    projectDetails: lead.projectDetails,
  }));

  return <LeadsClient leads={formattedLeads} />;
}
