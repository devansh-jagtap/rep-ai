import { classifyAiError } from "@/lib/ai/safe-logging";
import type { GenerateAgentReplyOutput } from "./types";

export const FALLBACK_REPLY =
  "Thanks for your message. Please leave your email and project details and the professional will get back to you shortly.";

export function fallback(errorType?: string): GenerateAgentReplyOutput {
  return {
    reply: FALLBACK_REPLY,
    lead: {
      lead_detected: false,
      confidence: 0,
      lead_data: null,
    },
    usage: {
      totalTokens: 0,
    },
    errorType,
  };
}

export async function withRetry<T>(operation: () => Promise<T>): Promise<
  | { ok: true; value: T; attempts: number }
  | { ok: false; firstErrorType: string; secondErrorType: string; attempts: number }
> {
  try {
    return { ok: true, value: await operation(), attempts: 1 };
  } catch (firstError) {
    const firstErrorType = classifyAiError(firstError);

    try {
      return { ok: true, value: await operation(), attempts: 2 };
    } catch (secondError) {
      return {
        ok: false,
        firstErrorType,
        secondErrorType: classifyAiError(secondError),
        attempts: 2,
      };
    }
  }
}
