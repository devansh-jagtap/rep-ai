import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { agentLeads } from "@/lib/schema";

interface SaveLeadInput {
  portfolioId: string;
  name: string | null;
  email: string | null;
  budget: string | null;
  projectDetails: string | null;
  confidence: number;
}

export async function isDuplicateLead(portfolioId: string, email: string): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [existing] = await db
    .select({ id: agentLeads.id })
    .from(agentLeads)
    .where(
      and(
        eq(agentLeads.portfolioId, portfolioId),
        eq(agentLeads.email, email),
        gte(agentLeads.createdAt, since)
      )
    )
    .orderBy(desc(agentLeads.createdAt))
    .limit(1);

  return Boolean(existing);
}

export async function saveLeadWithDedup(input: SaveLeadInput): Promise<"inserted" | "duplicate" | "skipped"> {
  const normalizedEmail = input.email?.trim().toLowerCase() ?? "";

  if (!normalizedEmail) {
    return "skipped";
  }

  const duplicate = await isDuplicateLead(input.portfolioId, normalizedEmail);

  if (duplicate) {
    return "duplicate";
  }

  await db.insert(agentLeads).values({
    id: crypto.randomUUID(),
    portfolioId: input.portfolioId,
    name: input.name,
    email: normalizedEmail,
    budget: input.budget,
    projectDetails: input.projectDetails,
    confidence: input.confidence,
  });

  return "inserted";
}
