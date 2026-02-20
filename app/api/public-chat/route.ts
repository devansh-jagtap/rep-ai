import { NextResponse } from "next/server";
import { generateAgentReply } from "@/lib/ai/generate-agent-reply";
import {
  isHandleTemporarilyBlocked,
  markHandleAiFailure,
  markHandleAiSuccess,
} from "@/lib/ai/failure-guard";
import { classifyAiError, logPublicAgentEvent } from "@/lib/ai/safe-logging";
import { saveLeadWithDedup } from "@/lib/db/agent-leads";
import { getPublishedPortfolioWithAgentByHandle } from "@/lib/db/portfolio";
import { isBehaviorPresetType } from "@/lib/agent/behavior-presets";
import { isSupportedAgentModel } from "@/lib/agent/models";
import { checkPublicChatHandleRateLimit, checkPublicChatIpRateLimit } from "@/lib/rate-limit";
import { validatePortfolioContent } from "@/lib/validation/portfolio-schema";
import { parsePublicChatRequest } from "@/lib/validation/public-chat";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const parsed = parsePublicChatRequest(body);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const ip = getClientIp(request);
    if (!checkPublicChatIpRateLimit(ip) || !checkPublicChatHandleRateLimit(parsed.handle)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    if (isHandleTemporarilyBlocked(parsed.handle)) {
      return NextResponse.json(
        { reply: "Agent temporarily unavailable. Please try again later." },
        { status: 200 }
      );
    }

    const portfolio = await getPublishedPortfolioWithAgentByHandle(parsed.handle);
    if (!portfolio || !portfolio.content) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    if (!portfolio.agentId || !portfolio.agentIsEnabled || !portfolio.agentModel) {
      return NextResponse.json({ error: "Agent unavailable" }, { status: 404 });
    }

    if (!isSupportedAgentModel(portfolio.agentModel)) {
      return NextResponse.json({ error: "Agent model misconfigured" }, { status: 500 });
    }

    if (
      typeof portfolio.agentTemperature !== "number" ||
      portfolio.agentTemperature < 0.2 ||
      portfolio.agentTemperature > 0.8
    ) {
      return NextResponse.json({ error: "Agent temperature misconfigured" }, { status: 500 });
    }

    const content = validatePortfolioContent(portfolio.content);
    const behaviorType =
      portfolio.agentBehaviorType && isBehaviorPresetType(portfolio.agentBehaviorType)
        ? portfolio.agentBehaviorType
        : null;

    const result = await generateAgentReply({
      model: portfolio.agentModel,
      temperature: portfolio.agentTemperature,
      behaviorType,
      customPrompt: portfolio.agentCustomPrompt,
      message: parsed.message,
      history: parsed.history,
      portfolio: content,
    });

    const leadDetected = result.lead.lead_detected && result.lead.confidence >= 60;

    if (leadDetected) {
      const dedupeResult = await saveLeadWithDedup({
        portfolioId: portfolio.id,
        name: result.lead.lead_data?.name?.trim() || null,
        email: result.lead.lead_data?.email?.trim() || null,
        budget: result.lead.lead_data?.budget?.trim() || null,
        projectDetails: result.lead.lead_data?.project_details?.trim() || null,
        confidence: result.lead.confidence,
      });

      if (dedupeResult === "duplicate") {
        console.info(
          JSON.stringify({
            event: "agent_lead_dedupe",
            handle: parsed.handle,
            portfolioId: portfolio.id,
            timestamp: new Date().toISOString(),
          })
        );
      }
    }

    if (result.errorType) {
      markHandleAiFailure(parsed.handle);
    } else {
      markHandleAiSuccess(parsed.handle);
    }

    logPublicAgentEvent({
      handle: parsed.handle,
      model: portfolio.agentModel,
      tokensUsed: result.usage.totalTokens,
      leadDetected,
      confidence: result.lead.confidence,
      errorType: result.errorType,
    });

    return NextResponse.json({ reply: result.reply, leadDetected });
  } catch (error) {
    const errorType = classifyAiError(error);
    console.error(
      JSON.stringify({
        event: "public_chat_route_error",
        error_type: errorType,
        timestamp: new Date().toISOString(),
      })
    );

    return NextResponse.json(
      {
        reply:
          "Thanks for your message. Please leave your email and project details and the professional will get back to you shortly.",
        leadDetected: false,
      },
      { status: 200 }
    );
  }
}
