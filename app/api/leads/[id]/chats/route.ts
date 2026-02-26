import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agentLeads } from "@/lib/schema";
import { requireUserId } from "@/lib/api/route-helpers";
import { getActivePortfolio } from "@/lib/active-portfolio";
import { getChatsByLeadId } from "@/lib/db/lead-chats";

export async function GET(
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

  const chats = await getChatsByLeadId(id);

  return NextResponse.json({ chats });
}
