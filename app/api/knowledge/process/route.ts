import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/route-helpers";
import { getUserAgent, getKnowledgeSourceByIdAndAgent } from "@/lib/db/knowledge";
import { processKnowledgeSource } from "@/lib/knowledge/processor";
import { getActivePortfolio } from "@/lib/active-portfolio";

export async function POST(request: Request) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const portfolio = await getActivePortfolio(auth.userId);
  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const agent = await getUserAgent(auth.userId, portfolio.id);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const sourceId = searchParams.get("sourceId");

  if (!sourceId) {
    return NextResponse.json({ error: "Missing sourceId" }, { status: 400 });
  }

  const existing = await getKnowledgeSourceByIdAndAgent({ id: sourceId, agentId: agent.id });
  if (!existing) {
    return NextResponse.json({ error: "Knowledge source not found" }, { status: 404 });
  }

  const result = await processKnowledgeSource(sourceId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
