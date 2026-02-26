import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { leadChatMessages, agentLeads } from "@/lib/schema";

interface SaveChatMessageInput {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
}

export async function saveChatMessage(input: SaveChatMessageInput) {
  await db.insert(leadChatMessages).values({
    id: crypto.randomUUID(),
    sessionId: input.sessionId,
    role: input.role,
    content: input.content,
  });
}

export async function linkMessagesToLead(leadId: string, sessionId: string) {
  await db
    .update(leadChatMessages)
    .set({ leadId })
    .where(eq(leadChatMessages.sessionId, sessionId));
}

export async function getChatsByLeadId(leadId: string) {
  const lead = await db.query.agentLeads.findFirst({
    where: eq(agentLeads.id, leadId),
  });

  if (!lead || !lead.sessionId) {
    return [];
  }

  const messages = await db
    .select({
      id: leadChatMessages.id,
      role: leadChatMessages.role,
      content: leadChatMessages.content,
      createdAt: leadChatMessages.createdAt,
    })
    .from(leadChatMessages)
    .where(eq(leadChatMessages.sessionId, lead.sessionId))
    .orderBy(asc(leadChatMessages.createdAt));

  return messages;
}
