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

export type LeadFieldPayload = {
  email: string | null;
  phone: string | null;
  website: string | null;
  projectDetails: string | null;
  budget: string | null;
};

function normalizeWebsite(website: string | null | undefined): string | null {
  const raw = website?.trim().toLowerCase();
  if (!raw) {
    return null;
  }

  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function parseLeadChannelsFromText(text: string): { phone: string | null; website: string | null } {
  const phoneMatch = text.match(/\+?[0-9][0-9\s().-]{6,}[0-9]/);
  const websiteMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[\w-./?%&=]*)?/i);

  return {
    phone: phoneMatch?.[0]?.trim() ?? null,
    website: normalizeWebsite(websiteMatch?.[0] ?? null),
  };
}

export function hasSufficientLeadFields(mode: ConversationStrategyMode, leadData: LeadFieldPayload): boolean {
  const hasEmail = Boolean(leadData.email?.trim());
  const hasProjectDetails = Boolean(leadData.projectDetails?.trim() && leadData.projectDetails.trim().length >= 20);
  const hasBudget = Boolean(leadData.budget?.trim());
  const hasAltContact = Boolean(leadData.phone?.trim() || leadData.website?.trim());

  switch (mode) {
    case "sales":
      return (hasEmail || hasAltContact) && (hasProjectDetails || hasBudget);
    case "consultative":
      return hasEmail || (hasProjectDetails && hasAltContact);
    case "passive":
      return false;
    default:
      return hasEmail;
  }
}

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
    const displayName = portfolio?.agentDisplayName ?? standaloneAgent?.displayName ?? null;
    const avatarUrl = portfolio?.agentAvatarUrl ?? standaloneAgent?.avatarUrl ?? null;
    const intro = portfolio?.agentIntro ?? standaloneAgent?.intro ?? null;
    const roleLabel = portfolio?.agentRoleLabel ?? standaloneAgent?.roleLabel ?? null;
    const workingHours = (portfolio as any)?.agentWorkingHours ?? (standaloneAgent as any)?.workingHours ?? null;
    const offDays = (portfolio as any)?.agentOffDays ?? (standaloneAgent as any)?.offDays ?? null;

    const result = await generateAgentReply({
      agentId,
      model: agentModel,
      temperature: agentTemperature,
      behaviorType,
      strategyMode,
      customPrompt: portfolio?.agentCustomPrompt ?? standaloneAgent?.customPrompt ?? null,
      displayName,
      avatarUrl,
      intro,
      roleLabel,
      message: input.message,
      history: input.history,
      portfolio: content,
      workingHours,
      offDays,
    });


    const industryType = content?.about?.paragraph ?? null;
    const threshold = leadConfidenceThresholdForMode(strategyMode, industryType);
    const extractedChannels = parseLeadChannelsFromText(input.message);
    const leadFields: LeadFieldPayload = {
      email: result.lead.lead_data?.email?.trim() || null,
      phone: extractedChannels.phone,
      website: extractedChannels.website,
      budget: result.lead.lead_data?.budget?.trim() || null,
      projectDetails: result.lead.lead_data?.project_details?.trim() || null,
    };

    const passesFieldThreshold = hasSufficientLeadFields(strategyMode, leadFields);
    const leadDetected =
      strategyMode !== "passive" &&
      result.lead.lead_detected &&
      result.lead.confidence >= threshold &&
      passesFieldThreshold;

    if (input.handle) {
      if (result.errorType) {
        markHandleAiFailure(input.handle);
      } else {
        markHandleAiSuccess(input.handle);
      }
    }

    // Fire-and-forget: don't block the reply on DB writes
    const latencyMs = Date.now() - startedAt;
    void (async () => {
      try {
        if (input.userId) {
          await consumeCredits(input.userId, CREDIT_COST);
        }

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
            email: leadFields.email,
            phone: leadFields.phone,
            website: leadFields.website,
            budget: leadFields.budget,
            projectDetails: leadFields.projectDetails,
            meetingTime: result.lead.lead_data?.meeting_time?.trim() || null,
            confidence: result.lead.confidence,
            sessionId,
            captureTurn: input.history.length + 1,
          });

          if (dedupeResult === "inserted") {
            const ownerId = (portfolio as any)?.userId ?? (standaloneAgent as any)?.userId;
            const customNotificationEmail = (portfolio as any)?.agentNotificationEmail ?? (standaloneAgent as any)?.notificationEmail;
            const sourceName = (portfolio as any)?.name ?? (standaloneAgent as any)?.displayName ?? "Standalone Agent";

            if (ownerId || customNotificationEmail) {
              try {
                const { getProfileById } = await import("@/lib/db");
                const { sendLeadNotificationEmail } = await import("@/lib/mail");

                let emailToUse = customNotificationEmail;
                if (!emailToUse && ownerId) {
                  const ownerProfile = await getProfileById(ownerId);
                  emailToUse = ownerProfile?.email;
                }

                if (emailToUse) {
                  await sendLeadNotificationEmail(emailToUse, {
                    name: result.lead.lead_data?.name?.trim() || null,
                    email: leadFields.email,
                    phone: leadFields.phone,
                    budget: leadFields.budget,
                    projectDetails: leadFields.projectDetails,
                    meetingTime: result.lead.lead_data?.meeting_time?.trim() || null,
                  }, sourceName);
                }
              } catch (e) {
                console.error("Failed to notify portfolio owner about new lead", e);
              }
            }
          }

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
          latencyMs,
          creditCost: input.userId ? CREDIT_COST : 0,
          metadata: {
            historyCount: input.history.length,
            threshold,
            industryType,
            passesFieldThreshold,
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
      } catch (bgErr) {
        console.error(
          JSON.stringify({
            event: "public_chat_background_error",
            message: bgErr instanceof Error ? bgErr.message : String(bgErr),
            timestamp: new Date().toISOString(),
          })
        );
      }
    })();

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
