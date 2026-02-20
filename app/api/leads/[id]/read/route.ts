import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agentLeads } from "@/lib/schema";
import { requireUserId } from "@/lib/api/route-helpers";
import { getPortfolioByUserId } from "@/lib/db/portfolio";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;

  const portfolio = await getPortfolioByUserId(authResult.userId);
  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const { id } = await context.params;

  const updated = await db
    .update(agentLeads)
    .set({ isRead: true })
    .where(and(eq(agentLeads.id, id), eq(agentLeads.portfolioId, portfolio.id)))
    .returning({ id: agentLeads.id, isRead: agentLeads.isRead });

  if (!updated[0]) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead: updated[0] });
}

