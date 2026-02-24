import type { OnboardingData } from "@/lib/onboarding/types";
import { validateFinalOnboardingState } from "@/lib/onboarding/validation";

export const INITIAL_GREETING =
  "Hi! I'm here to help you set up your portfolio on ref. Let's start with the basics—what's your full name?";

const CONFIRM_PHRASES = [
  "is that correct",
  "does that look",
  "should i use",
  "look right",
  "look good",
  "is that right",
  "correct?",
  "looks good?",
  "sound good",
  "does that work",
  "should we go with",
];

type ToolResultLike = {
  success?: boolean;
  preview?: unknown;
  data?: unknown;
};

export type MessagePartLike = {
  type?: string;
  text?: string;
  toolName?: string;
  result?: ToolResultLike;
};

export type ChatMessageLike = {
  role?: string;
  parts: MessagePartLike[];
  toolInvocations?: MessagePartLike[];
};

function isCompletePreviewData(value: unknown): value is OnboardingData {
  if (!value || typeof value !== "object") return false;
  return validateFinalOnboardingState(value as Partial<OnboardingData>).ok;
}

export function lastMessageAsksConfirmation(messages: ChatMessageLike[]): boolean {
  if (messages.length === 0) return false;
  const last = messages[messages.length - 1];
  if (last.role !== "assistant") return false;
  const text = last.parts
    .filter((p): p is { type: "text"; text: string } => (p as { type?: string; text?: string }).type === "text" && typeof (p as { text?: string }).text === "string")
    .map((p) => p.text)
    .join(" ")
    .toLowerCase();
  return CONFIRM_PHRASES.some((phrase) => text.includes(phrase));
}

export function extractPreviewData(messages: ChatMessageLike[]): OnboardingData | null {
  for (const message of messages) {
    if (message.role !== "assistant") continue;

    if (message.toolInvocations) {
      for (const tool of message.toolInvocations) {
        if (
          tool.toolName === "request_preview" &&
          tool.result?.preview &&
          isCompletePreviewData(tool.result.data)
        ) {
          return tool.result.data;
        }
      }
    }

    for (const part of message.parts) {
      if (
        part.type === "tool-invocation" &&
        part.toolName === "request_preview" &&
        part.result?.preview &&
        isCompletePreviewData(part.result.data)
      ) {
        return part.result.data;
      }
    }
  }

  return null;
}
