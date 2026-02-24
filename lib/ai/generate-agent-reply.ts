import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { buildPrompt } from "@/lib/ai/generate-agent-reply/prompt-builder";
import {
  prepareKnowledgeBlocks,
  trimHistory,
} from "@/lib/ai/generate-agent-reply/context-preparation";
import { parseLeadPayload } from "@/lib/ai/generate-agent-reply/response-parser";
import {
  fallback,
  withRetry,
} from "@/lib/ai/generate-agent-reply/retry-policy";
import type {
  GenerateAgentReplyInput,
  GenerateAgentReplyOutput,
} from "@/lib/ai/generate-agent-reply/types";

export type {
  AgentMessage,
  AgentLeadPayload,
  GenerateAgentReplyInput,
  GenerateAgentReplyOutput,
} from "@/lib/ai/generate-agent-reply/types";

const nebius = createOpenAI({
  apiKey: process.env.NEBIUS_API_KEY,
  baseURL: process.env.NEBIUS_BASE_URL ?? "https://api.studio.nebius.com/v1",
});

function isSafeTemperature(temperature: number): boolean {
  return Number.isFinite(temperature) && temperature >= 0.2 && temperature <= 0.8;
}

async function requestReply(input: GenerateAgentReplyInput): Promise<{ text: string; tokens: number }> {
  const sanitizedHistory = trimHistory(input.history);
  const knowledgeBlocks = await prepareKnowledgeBlocks(input);

  const result = await generateText({
    model: nebius.chat(input.model),
    system: buildPrompt(input, knowledgeBlocks),
    messages: [...sanitizedHistory, { role: "user" as const, content: input.message }],
    temperature: input.temperature,
    maxOutputTokens: 700,
  });

  const totalTokens =
    result.usage?.totalTokens ?? ((result.usage?.inputTokens ?? 0) + (result.usage?.outputTokens ?? 0));

  return { text: result.text, tokens: totalTokens };
}

export async function generateAgentReply(input: GenerateAgentReplyInput): Promise<GenerateAgentReplyOutput> {
  if (!isSafeTemperature(input.temperature)) {
    return fallback("UnsafeTemperature");
  }

  const attempt = await withRetry(requestReply.bind(null, input));

  if (!attempt.ok) {
    return fallback(`${attempt.firstErrorType}:${attempt.secondErrorType}`);
  }

  const parsed = parseLeadPayload(attempt.value.text);
  if (!parsed) {
    if (attempt.attempts === 1) {
      const retryAttempt = await withRetry(requestReply.bind(null, input));
      if (!retryAttempt.ok) {
        return fallback(`${retryAttempt.firstErrorType}:${retryAttempt.secondErrorType}`);
      }
      const retryParsed = parseLeadPayload(retryAttempt.value.text);
      if (!retryParsed) {
        return fallback("LeadParseFailure");
      }
      return {
        reply: retryParsed.reply,
        lead: retryParsed.lead,
        usage: { totalTokens: attempt.value.tokens + retryAttempt.value.tokens },
      };
    }

    return fallback("LeadParseFailure");
  }

  return {
    reply: parsed.reply,
    lead: parsed.lead,
    usage: { totalTokens: attempt.value.tokens },
  };
}
