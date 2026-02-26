import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { agentLeads } from "@/lib/schema";
import { linkMessagesToLead } from "./lead-chats";

interface SaveLeadInput {
  portfolioId: string;
  name: string | null;
  email: string | null;
  budget: string | null;
  projectDetails: string | null;
  confidence: number;
  sessionId: string;
}

interface ExistingLead {
  id: string;
  name: string | null;
  email: string | null;
  budget: string | null;
  projectDetails: string | null;
  confidence: number;
}

export async function findExistingLead(portfolioId: string, email: string): Promise<ExistingLead | null> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [existing] = await db
    .select({
      id: agentLeads.id,
      name: agentLeads.name,
      email: agentLeads.email,
      budget: agentLeads.budget,
      projectDetails: agentLeads.projectDetails,
      confidence: agentLeads.confidence,
    })
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

  return existing ?? null;
}

function mergeLeadData(existing: ExistingLead, input: SaveLeadInput) {
  const mergedName = input.name?.trim() || existing.name;
  const mergedBudget = input.budget?.trim() || existing.budget;
  const mergedProjectDetails = input.projectDetails?.trim() || existing.projectDetails;
  const mergedConfidence = Math.max(existing.confidence, input.confidence);

  return {
    name: mergedName,
    budget: mergedBudget,
    projectDetails: mergedProjectDetails,
    confidence: mergedConfidence,
  };
}

export async function saveLeadWithDedup(input: SaveLeadInput): Promise<"inserted" | "updated" | "skipped"> {
  const normalizedEmail = input.email?.trim().toLowerCase() ?? "";

  if (!normalizedEmail) {
    return "skipped";
  }

  const existing = await findExistingLead(input.portfolioId, normalizedEmail);

  if (existing) {
    const merged = mergeLeadData(existing, input);
    
    const hasChanges = 
      merged.name !== existing.name ||
      merged.budget !== existing.budget ||
      merged.projectDetails !== existing.projectDetails ||
      merged.confidence !== existing.confidence;

    if (hasChanges || existing.sessionId !== input.sessionId) {
      await db
        .update(agentLeads)
        .set({ ...merged, sessionId: input.sessionId })
        .where(eq(agentLeads.id, existing.id));
      await linkMessagesToLead(existing.id, input.sessionId);
      return "updated";
    }

    await linkMessagesToLead(existing.id, input.sessionId);

    return "updated";
  }

  const leadId = crypto.randomUUID();
  await db.insert(agentLeads).values({
    id: leadId,
    portfolioId: input.portfolioId,
    name: input.name,
    email: normalizedEmail,
    budget: input.budget,
    projectDetails: input.projectDetails,
    confidence: input.confidence,
    sessionId: input.sessionId,
  });

  await linkMessagesToLead(leadId, input.sessionId);

  return "inserted";
}
