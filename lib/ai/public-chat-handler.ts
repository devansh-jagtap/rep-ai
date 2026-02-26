import { generateAgentReply } from "@/lib/ai/generate-agent-reply";
import {
  isHandleTemporarilyBlocked,
  markHandleAiFailure,
  markHandleAiSuccess,
} from "@/lib/ai/failure-guard";
import { classifyAiError, logPublicAgentEvent } from "@/lib/ai/safe-logging";
import { saveLeadWithDedup } from "@/lib/db/agent-leads";
import { saveChatMessage } from "@/lib/db/lead-chats";
import {
  getPortfolioWithAgentByAgentId,
  getPortfolioWithAgentByHandle,
} from "@/lib/db/portfolio";
import { isBehaviorPresetType } from "@/lib/agent/behavior-presets";
import { isSupportedAgentModel } from "@/lib/agent/models";
import {
  isConversationStrategyMode,
  leadConfidenceThresholdForMode,
  type ConversationStrategyMode,
} from "@/lib/agent/strategy-modes";
import {
  checkPublicChatAgentRateLimit,
  checkPublicChatHandleRateLimit,
  checkPublicChatIpRateLimit,
} from "@/lib/rate-limit";
import { validatePortfolioContent } from "@/lib/validation/portfolio-schema";
import { trackAnalytics } from "@/lib/db/analytics";
import { consumeCredits, getCredits } from "@/lib/credits";
import type { PublicHistoryMessage } from "@/lib/validation/public-chat";

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
      return { ok: true, reply: "Agent temporarily unavailable. Please try again later.", leadDetected: false, sessionId: input.sessionId || crypto.randomUUID() };
    }

    if (input.userId) {
      const currentCredits = await getCredits(input.userId);
      if (currentCredits < CREDIT_COST) {
        return { ok: false, error: "Not enough credits", status: 402 };
      }
    }

    const portfolio = input.agentId
      ? await getPortfolioWithAgentByAgentId(input.agentId)
      : await getPortfolioWithAgentByHandle(input.handle ?? "");

    if (!portfolio || !portfolio.content) {
      return { ok: false, error: "Portfolio not found", status: 404 };
    }

    if (!portfolio.isPublished && portfolio.userId !== input.userId) {
      return { ok: false, error: "Portfolio not found", status: 404 };
    }

    if (!portfolio.agentId || !portfolio.agentIsEnabled || !portfolio.agentModel) {
      return { ok: false, error: "Agent unavailable", status: 404 };
    }

    if (!isSupportedAgentModel(portfolio.agentModel)) {
      return { ok: false, error: "Agent model misconfigured", status: 500 };
    }

    if (
      typeof portfolio.agentTemperature !== "number" ||
      portfolio.agentTemperature < 0.2 ||
      portfolio.agentTemperature > 0.8
    ) {
      return { ok: false, error: "Agent temperature misconfigured", status: 500 };
    }

    const content = validatePortfolioContent(portfolio.content);
    const behaviorType =
      portfolio.agentBehaviorType && isBehaviorPresetType(portfolio.agentBehaviorType)
        ? portfolio.agentBehaviorType
        : null;

    const strategyMode: ConversationStrategyMode =
      portfolio.agentStrategyMode && isConversationStrategyMode(String(portfolio.agentStrategyMode))
        ? (String(portfolio.agentStrategyMode) as ConversationStrategyMode)
        : "consultative";

    const result = await generateAgentReply({
      agentId: portfolio.agentId,
      model: portfolio.agentModel,
      temperature: portfolio.agentTemperature,
      behaviorType,
      strategyMode,
      customPrompt: portfolio.agentCustomPrompt,
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

    const sessionId = input.sessionId || crypto.randomUUID();

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
        portfolioId: portfolio.id,
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
            handle: portfolio.handle,
            portfolioId: portfolio.id,
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

    logPublicAgentEvent({
      handle: portfolio.handle,
      model: portfolio.agentModel,
      tokensUsed: result.usage.totalTokens,
      leadDetected,
      confidence: result.lead.confidence,
      errorType: result.errorType,
    });

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

    return { ok: true, reply: FALLBACK_REPLY, leadDetected: false, sessionId: input.sessionId || crypto.randomUUID() };
  }
}
