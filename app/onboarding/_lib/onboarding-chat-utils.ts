import type { OnboardingData } from "@/lib/onboarding/types";
import { validateFinalOnboardingState } from "@/lib/onboarding/validation";

export const INITIAL_GREETING =
  "Hi! Let’s choose your setup path: **I already have a website** (agent only) or **Build me a portfolio + agent** (start from scratch).";

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
  data?: unknown;
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

/** True when user just sent a confirmation (last msg from user) and the assistant had asked for confirmation before that. */
export function userJustConfirmed(messages: ChatMessageLike[]): boolean {
  if (messages.length < 2) return false;
  const last = messages[messages.length - 1];
  if (last.role !== "user") return false;
  const prev = messages[messages.length - 2];
  if (prev.role !== "assistant") return false;
  const prevText = prev.parts
    .filter((p): p is { type: "text"; text: string } => (p as { type?: string; text?: string }).type === "text" && typeof (p as { text?: string }).text === "string")
    .map((p) => p.text)
    .join(" ")
    .toLowerCase();
  return CONFIRM_PHRASES.some((phrase) => prevText.includes(phrase));
}

export function extractPreviewData(messages: ChatMessageLike[]): OnboardingData | null {
  for (const message of messages) {
    if (message.role !== "assistant") continue;

    if (message.toolInvocations) {
      for (const tool of message.toolInvocations) {
        if (
          tool.toolName === "request_preview" &&
          tool.result &&
          (tool.result as ToolResultLike).preview &&
          isCompletePreviewData((tool.result as ToolResultLike).data)
        ) {
          return (tool.result as ToolResultLike).data as OnboardingData;
        }
      }
    }

    for (const part of message.parts) {
      const isToolPart =
        (part.type === "tool-invocation" || part.type === "tool-result") &&
        part.toolName === "request_preview";
      const result = part.result as ToolResultLike | undefined;
      if (isToolPart && result?.preview && isCompletePreviewData(result.data)) {
        return result.data as OnboardingData;
      }
    }
  }

  return null;
}
