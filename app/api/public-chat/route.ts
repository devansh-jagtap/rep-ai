import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agentLeads } from "@/lib/schema";
import { generateAgentReply } from "@/lib/ai/generate-agent-reply";
import { getPublishedPortfolioWithAgentByHandle } from "@/lib/db/portfolio";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateHandle } from "@/lib/validation/handle";
import { isBehaviorPresetType } from "@/lib/agent/behavior-presets";
import { isSupportedAgentModel } from "@/lib/agent/models";
import { validatePortfolioContent } from "@/lib/validation/portfolio-schema";

interface PublicChatBody {
  handle?: unknown;
  message?: unknown;
  history?: unknown;
}

interface PublicHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

function parseHistory(input: unknown): PublicHistoryMessage[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const roleValue = "role" in item ? item.role : null;
      const contentValue = "content" in item ? item.content : null;

      if ((roleValue !== "user" && roleValue !== "assistant") || typeof contentValue !== "string") {
        return null;
      }

      return {
        role: roleValue,
        content: contentValue.slice(0, 1500),
      } as PublicHistoryMessage;
    })
    .filter((entry): entry is PublicHistoryMessage => entry !== null)
    .slice(-10);
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as PublicChatBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const handleResult = validateHandle(String(body.handle ?? ""));
  if (!handleResult.ok) {
    return NextResponse.json({ error: "Invalid handle" }, { status: 400 });
  }

  const message = String(body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const ip = getClientIp(request);
  if (!checkRateLimit(`public-chat:${handleResult.value}:${ip}`)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const portfolio = await getPublishedPortfolioWithAgentByHandle(handleResult.value);
  if (!portfolio || !portfolio.content) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  if (!portfolio.agentId || !portfolio.agentIsEnabled || !portfolio.agentModel) {
    return NextResponse.json({ error: "Agent unavailable" }, { status: 404 });
  }

  if (!isSupportedAgentModel(portfolio.agentModel)) {
    return NextResponse.json({ error: "Agent model misconfigured" }, { status: 500 });
  }

  let content;
  try {
    content = validatePortfolioContent(portfolio.content);
  } catch {
    return NextResponse.json({ error: "Invalid portfolio content" }, { status: 500 });
  }

  const behaviorType =
    portfolio.agentBehaviorType && isBehaviorPresetType(portfolio.agentBehaviorType)
      ? portfolio.agentBehaviorType
      : null;

  const result = await generateAgentReply({
    model: portfolio.agentModel,
    temperature: portfolio.agentTemperature ?? 0.5,
    behaviorType,
    customPrompt: portfolio.agentCustomPrompt,
    message,
    history: parseHistory(body.history),
    portfolio: content,
  });

  if (result.lead.lead_detected && result.lead.confidence >= 60) {
    const leadData = result.lead.lead_data;

    await db.insert(agentLeads).values({
      id: crypto.randomUUID(),
      portfolioId: portfolio.id,
      name: leadData?.name ?? null,
      email: leadData?.email ?? null,
      budget: leadData?.budget ?? null,
      projectDetails: leadData?.project_details ?? null,
      confidence: result.lead.confidence,
    });
  }

  return NextResponse.json({ reply: result.reply, leadDetected: result.lead.lead_detected });
}
