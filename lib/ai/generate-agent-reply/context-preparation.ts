import { hybridSearchKnowledgeByAgentId } from "@/lib/db/knowledge";
import type { AgentMessage, GenerateAgentReplyInput } from "./types";

export function trimHistory(history: AgentMessage[]): AgentMessage[] {
  return history
    .filter((entry) => entry.role === "user" || entry.role === "assistant")
    .slice(-8)
    .map((entry) => ({
      role: entry.role,
      content: entry.content.slice(0, 1200),
    }));
}

export function limitKnowledgeChunks(chunks: string[]): string[] {
  const MAX_TOTAL_CHARS = 4_500;
  const limited: string[] = [];
  let total = 0;

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    if (total + trimmed.length > MAX_TOTAL_CHARS) {
      const remaining = MAX_TOTAL_CHARS - total;
      if (remaining > 120) {
        limited.push(`${trimmed.slice(0, remaining)}...`);
      }
      break;
    }

    limited.push(trimmed);
    total += trimmed.length;
  }

  return limited;
}

export async function prepareKnowledgeBlocks(input: GenerateAgentReplyInput): Promise<string[]> {
  const relevantChunks = await hybridSearchKnowledgeByAgentId(input.agentId, input.message, 5);
  return limitKnowledgeChunks(relevantChunks);
}
