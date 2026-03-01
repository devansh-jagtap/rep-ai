import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { agentLeads } from "@/lib/schema";
import { requireUserId } from "@/lib/api/route-helpers";
import { getActivePortfolio } from "@/lib/active-portfolio";
import { getChatsByLeadId } from "@/lib/db/lead-chats";
import { generateWarmIntroDraft } from "@/lib/ai/warm-intro";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;

  const portfolio = await getActivePortfolio(authResult.userId);
  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const { id } = await context.params;

  const lead = await db.query.agentLeads.findFirst({
    where: and(eq(agentLeads.id, id), eq(agentLeads.portfolioId, portfolio.id)),
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  try {
    const chats = await getChatsByLeadId(id);
    const draft = await generateWarmIntroDraft({
      recipientName: lead.name,
      recipientEmail: lead.email,
      budget: lead.budget,
      projectSummary: lead.conversationSummary,
      projectDetails: lead.projectDetails,
      recentConversation: chats.map((chat) => ({ role: chat.role, content: chat.content })),
    });

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("[warm-intro] failed", error);
    return NextResponse.json({ error: "Failed to generate warm intro email" }, { status: 500 });
  }
}
