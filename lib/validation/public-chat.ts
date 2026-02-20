import { validate as validateUuid } from "uuid";
import { validateHandle } from "@/lib/validation/handle";

export interface PublicHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

interface PublicChatBody {
  handle?: unknown;
  agentId?: unknown;
  message?: unknown;
  history?: unknown;
}

export interface PublicChatRequest {
  handle: string | null;
  agentId: string | null;
  message: string;
  history: PublicHistoryMessage[];
}

const MAX_MESSAGE_CHARS = 2_000;
const MAX_HISTORY_MESSAGES = 8;
const MAX_HISTORY_CONTENT_CHARS = 1_200;

export function parsePublicChatRequest(body: PublicChatBody | null): PublicChatRequest | null {
  if (!body) {
    return null;
  }

  const rawHandle = String(body.handle ?? "").trim();
  const handleResult = rawHandle ? validateHandle(rawHandle) : null;
  const handle = handleResult?.ok && rawHandle === handleResult.value ? handleResult.value : null;

  const rawAgentId = String(body.agentId ?? "").trim();
  const agentId = rawAgentId && validateUuid(rawAgentId) ? rawAgentId : null;

  if (!handle && !agentId) {
    return null;
  }

  const trimmedMessage = String(body.message ?? "").trim();
  if (!trimmedMessage || trimmedMessage.length > MAX_MESSAGE_CHARS) {
    return null;
  }

  return {
    handle,
    agentId,
    message: trimmedMessage,
    history: sanitizeHistory(body.history),
  };
}

export function sanitizeHistory(input: unknown): PublicHistoryMessage[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const cleaned = input
    .map((item): PublicHistoryMessage | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const roleValue = "role" in item ? item.role : null;
      const contentValue = "content" in item ? item.content : null;

      if ((roleValue !== "user" && roleValue !== "assistant") || typeof contentValue !== "string") {
        return null;
      }

      const content = contentValue.trim();
      if (!content) {
        return null;
      }

      return {
        role: roleValue,
        content: content.slice(0, MAX_HISTORY_CONTENT_CHARS),
      };
    })
    .filter((entry): entry is PublicHistoryMessage => entry !== null);

  return cleaned.slice(-MAX_HISTORY_MESSAGES);
}
