import { NextResponse } from "next/server";
import { parseJsonBody, requireUserId } from "@/lib/api/route-helpers";
import { deleteKnowledgeSource, getUserAgent } from "@/lib/db/knowledge";
import { updateKnowledgeSource } from "@/lib/knowledge/service";
import { parseKnowledgeInput } from "@/lib/validation/knowledge";
import { getActivePortfolio } from "@/lib/active-portfolio";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const json = await parseJsonBody<Record<string, unknown>>(request);
  if (!json.ok) return json.response;

  const parsed = parseKnowledgeInput(json.body);
  if (!parsed) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  if (parsed.type !== "text") {
    return NextResponse.json({ error: "Can only edit text sources" }, { status: 400 });
  }

  const portfolio = await getActivePortfolio(auth.userId);
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

  const agent = await getUserAgent(auth.userId, portfolio.id);
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const updated = await updateKnowledgeSource({ id, agentId: agent.id, title: parsed.title, content: parsed.content });
  if (!updated.ok) return NextResponse.json({ error: updated.error }, { status: 404 });

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const portfolio = await getActivePortfolio(auth.userId);
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

  const agent = await getUserAgent(auth.userId, portfolio.id);
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const deleted = await deleteKnowledgeSource({ id, agentId: agent.id });
  if (!deleted) return NextResponse.json({ error: "Knowledge source not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
