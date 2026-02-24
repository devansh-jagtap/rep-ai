import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agentLeads } from "@/lib/schema";
import { requireUserId, parseJsonBody } from "@/lib/api/route-helpers";
import { getActivePortfolio } from "@/lib/active-portfolio";

const ALLOWED_STATUSES = ["new", "contacted", "closed"] as const;
type LeadStatus = (typeof ALLOWED_STATUSES)[number];

function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (ALLOWED_STATUSES as readonly string[]).includes(value);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;

  const portfolio = await getActivePortfolio(authResult.userId);
  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const jsonResult = await parseJsonBody<{ status?: unknown }>(request);
  if (!jsonResult.ok) return jsonResult.response;

  const nextStatus = jsonResult.body.status;
  if (!isLeadStatus(nextStatus)) {
    return NextResponse.json(
      { error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const { id } = await context.params;

  const updated = await db
    .update(agentLeads)
    .set({ status: nextStatus })
    .where(and(eq(agentLeads.id, id), eq(agentLeads.portfolioId, portfolio.id)))
    .returning({ id: agentLeads.id, status: agentLeads.status });

  if (!updated[0]) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead: updated[0] });
}
