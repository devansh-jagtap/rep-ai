import { NextResponse } from "next/server";
import { configureAgentForPortfolio } from "@/lib/agent/configure";
import { parseJsonBody, requireUserId } from "@/lib/api/route-helpers";
import { getActivePortfolio } from "@/lib/active-portfolio";

interface ConfigureRequestBody {
  isEnabled?: unknown;
  model?: unknown;
  behaviorType?: unknown;
  strategyMode?: unknown;
  customPrompt?: unknown;
  temperature?: unknown;
}

export async function POST(request: Request) {
  const authResult = await requireUserId();
  if (!authResult.ok) {
    return authResult.response;
  }

  const jsonResult = await parseJsonBody<ConfigureRequestBody>(request);
  if (!jsonResult.ok) {
    return jsonResult.response;
  }

  const portfolio = await getActivePortfolio(authResult.userId);
  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const result = await configureAgentForPortfolio(portfolio.id, {
    isEnabled: Boolean(jsonResult.body.isEnabled),
    model: String(jsonResult.body.model ?? ""),
    behaviorType: jsonResult.body.behaviorType ? String(jsonResult.body.behaviorType) : null,
    strategyMode: String(jsonResult.body.strategyMode ?? "consultative"),
    customPrompt: jsonResult.body.customPrompt ? String(jsonResult.body.customPrompt) : null,
    temperature: Number(jsonResult.body.temperature ?? 0.5),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}
