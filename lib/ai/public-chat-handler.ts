import { generateAgentReply } from "@/lib/ai/generate-agent-reply";
import {
  isHandleTemporarilyBlocked,
  markHandleAiFailure,
  markHandleAiSuccess,
} from "@/lib/ai/failure-guard";
import { classifyAiError, logPublicAgentEvent } from "@/lib/ai/safe-logging";
import { saveLeadWithDedup } from "@/lib/db/agent-leads";
import { trackAnalytics } from "@/lib/db/analytics";
import { saveChatMessage } from "@/lib/db/lead-chats";
import { getAgentCoreConfigById } from "@/lib/db/knowledge";
import {
  getPortfolioBackedAgentContextByAgentId,
  getPortfolioBackedAgentContextByHandle,
} from "@/lib/db/portfolio";
import { isBehaviorPresetType } from "@/lib/agent/behavior-presets";
import { isSupportedAgentModel } from "@/lib/agent/models";
import {
  isConversationStrategyMode,
  leadConfidenceThresholdForMode,
  type ConversationStrategyMode,
} from "@/lib/agent/strategy-modes";
import { consumeCredits, getCredits } from "@/lib/credits";
import {
  checkPublicChatAgentRateLimit,
  checkPublicChatHandleRateLimit,
  checkPublicChatIpRateLimit,
} from "@/lib/rate-limit";
import type { PublicHistoryMessage } from "@/lib/validation/public-chat";
import { validatePortfolioContent } from "@/lib/validation/portfolio-schema";

const CREDIT_COST = 1;

const FALLBACK_REPLY =
  "Thanks for your message. Please leave your email and project details and the professional will get back to you shortly.";

export interface PublicChatInput {
  handle: string | null;
  agentId: string | null;
  message: string;
  history: PublicHistoryMessage[];
  sessionId: string | null;
  ip: string;
  userId: string | null;
}

export type PublicChatResult =
  | { ok: true; reply: string; leadDetected: boolean; sessionId: string }
  | { ok: false; error: string; status: number };

export async function handlePublicChat(input: PublicChatInput): Promise<PublicChatResult> {
  const startedAt = Date.now();
  const sessionId = input.sessionId || crypto.randomUUID();

  try {
    if (!checkPublicChatIpRateLimit(input.ip)) {
      return { ok: false, error: "Rate limit exceeded", status: 429 };
    }

    if (input.handle && !checkPublicChatHandleRateLimit(input.handle)) {
      return { ok: false, error: "Rate limit exceeded", status: 429 };
    }

    if (input.agentId && !checkPublicChatAgentRateLimit(input.agentId)) {
      return { ok: false, error: "Rate limit exceeded", status: 429 };
    }

    if (input.handle && isHandleTemporarilyBlocked(input.handle)) {
      return {
        ok: true,
        reply: "Agent temporarily unavailable. Please try again later.",
        leadDetected: false,
        sessionId,
      };
    }

    if (input.userId) {
      const currentCredits = await getCredits(input.userId);
      if (currentCredits < CREDIT_COST) {
        return { ok: false, error: "Not enough credits", status: 402 };
      }
    }

    const portfolio = input.agentId
      ? await getPortfolioBackedAgentContextByAgentId(input.agentId)
      : await getPortfolioBackedAgentContextByHandle(input.handle ?? "");

    const standaloneAgent = !portfolio && input.agentId ? await getAgentCoreConfigById(input.agentId) : null;

    if (!portfolio && !standaloneAgent) {
      return { ok: false, error: "Agent not found", status: 404 };
    }

    if (portfolio && !portfolio.isPublished && portfolio.userId !== input.userId) {
      return { ok: false, error: "Portfolio not found", status: 404 };
    }

    const agentId = portfolio?.agentId ?? standaloneAgent?.agentId;
    const agentIsEnabled = portfolio?.agentIsEnabled ?? standaloneAgent?.isEnabled;
    const agentModel = portfolio?.agentModel ?? standaloneAgent?.model;
    const agentTemperature = portfolio?.agentTemperature ?? standaloneAgent?.temperature;

    if (!agentId || !agentIsEnabled || !agentModel) {
      return { ok: false, error: "Agent unavailable", status: 404 };
    }

    const handle = portfolio?.handle ?? input.handle ?? `agent:${agentId}`;

    if (!isSupportedAgentModel(agentModel)) {
      await logPublicAgentEvent({
        handle,
        agentId,
        portfolioId: portfolio?.id ?? null,
        sessionId,
        model: agentModel,
        mode: "unknown",
        tokensUsed: 0,
        leadDetected: false,
        confidence: 0,
        success: false,
        fallbackReason: "AgentModelMisconfigured",
        latencyMs: Date.now() - startedAt,
        creditCost: 0,
      });

      return { ok: false, error: "Agent model misconfigured", status: 500 };
    }

    if (typeof agentTemperature !== "number" || agentTemperature < 0.2 || agentTemperature > 0.8) {
      await logPublicAgentEvent({
        handle,
        agentId,
        portfolioId: portfolio?.id ?? null,
        sessionId,
        model: agentModel,
        mode: "unknown",
        tokensUsed: 0,
        leadDetected: false,
        confidence: 0,
        success: false,
        fallbackReason: "AgentTemperatureMisconfigured",
        latencyMs: Date.now() - startedAt,
        creditCost: 0,
      });

      return { ok: false, error: "Agent temperature misconfigured", status: 500 };
    }

    const behaviorTypeRaw = portfolio?.agentBehaviorType ?? standaloneAgent?.behaviorType;
    const behaviorType =
      behaviorTypeRaw && isBehaviorPresetType(behaviorTypeRaw) ? behaviorTypeRaw : null;

    const strategyRaw = portfolio?.agentStrategyMode ?? standaloneAgent?.strategyMode;
    const strategyMode: ConversationStrategyMode =
      strategyRaw && isConversationStrategyMode(String(strategyRaw))
        ? (String(strategyRaw) as ConversationStrategyMode)
        : "consultative";

    const content = portfolio?.content ? validatePortfolioContent(portfolio.content) : null;

    const result = await generateAgentReply({
      agentId,
      model: agentModel,
      temperature: agentTemperature,
      behaviorType,
      strategyMode,
      customPrompt: portfolio?.agentCustomPrompt ?? standaloneAgent?.customPrompt ?? null,
      message: input.message,
      history: input.history,
      portfolio: content,
    });

    if (input.userId) {
      await consumeCredits(input.userId, CREDIT_COST);
    }

    const threshold = leadConfidenceThresholdForMode(strategyMode);
    const leadDetected =
      strategyMode !== "passive" && result.lead.lead_detected && result.lead.confidence >= threshold;

    await saveChatMessage({
      sessionId,
      role: "user",
      content: input.message,
    });

    await saveChatMessage({
      sessionId,
      role: "assistant",
      content: result.reply,
    });

    if (leadDetected) {
      const dedupeResult = await saveLeadWithDedup({
        agentId,
        portfolioId: portfolio?.id ?? null,
        name: result.lead.lead_data?.name?.trim() || null,
        email: result.lead.lead_data?.email?.trim() || null,
        budget: result.lead.lead_data?.budget?.trim() || null,
        projectDetails: result.lead.lead_data?.project_details?.trim() || null,
        confidence: result.lead.confidence,
        sessionId,
      });

      if (dedupeResult === "updated") {
        console.info(
          JSON.stringify({
            event: "agent_lead_updated",
            handle: portfolio?.handle ?? null,
            portfolioId: portfolio?.id ?? null,
            agentId,
            timestamp: new Date().toISOString(),
          })
        );
      }
    }

    if (input.handle) {
      if (result.errorType) {
        markHandleAiFailure(input.handle);
      } else {
        markHandleAiSuccess(input.handle);
      }
    }

    await logPublicAgentEvent({
      handle,
      agentId,
      portfolioId: portfolio?.id ?? null,
      sessionId,
      model: agentModel,
      mode: strategyMode,
      tokensUsed: result.usage.totalTokens,
      leadDetected,
      confidence: result.lead.confidence,
      success: !result.errorType,
      fallbackReason: result.errorType ?? null,
      latencyMs: Date.now() - startedAt,
      creditCost: input.userId ? CREDIT_COST : 0,
      metadata: {
        historyCount: input.history.length,
        threshold,
      },
    });

    if (portfolio) {
      const isFirstMessage = !input.history || input.history.length === 0;

      if (isFirstMessage) {
        await trackAnalytics({
          portfolioId: portfolio.id,
          type: "chat_session_start",
          sessionId,
        });
      }

      await trackAnalytics({
        portfolioId: portfolio.id,
        type: "chat_message",
        sessionId,
      });
    }

    return { ok: true, reply: result.reply, leadDetected, sessionId };
  } catch (error) {
    const errorType = classifyAiError(error);
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    console.error(
      JSON.stringify({
        event: "public_chat_handler_error",
        error_type: errorType,
        message,
        ...(stack && { stack }),
        timestamp: new Date().toISOString(),
      })
    );

    await logPublicAgentEvent({
      handle: input.handle ?? "unknown",
      agentId: input.agentId ?? null,
      portfolioId: null,
      sessionId,
      model: "unknown",
      mode: "unknown",
      tokensUsed: 0,
      leadDetected: false,
      confidence: 0,
      success: false,
      fallbackReason: `HandlerError:${errorType}`,
      latencyMs: Date.now() - startedAt,
      creditCost: 0,
      metadata: {
        message,
      },
    });

    return { ok: true, reply: FALLBACK_REPLY, leadDetected: false, sessionId };
  }
}
