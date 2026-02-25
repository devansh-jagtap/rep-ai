import { cosineSimilarity, generateEmbedding, generateEmbeddings } from "@/lib/ai/embeddings";
import {
  countKnowledgeSourcesByAgentId,
  createKnowledgeSourceRecord,
  deleteKnowledgeChunksBySourceId,
  getKnowledgeChunksForSearch,
  getKnowledgeChunksWithoutEmbeddings,
  getKnowledgeSourceByIdAndAgent,
  getRecentKnowledgeChunksByAgentId,
  insertKnowledgeChunks,
  updateChunkEmbedding,
  updateKnowledgeSourceRecord,
} from "@/lib/db/knowledge";
import { chunkText } from "@/lib/knowledge/chunk-text";

const MAX_KNOWLEDGE_SOURCES_PER_AGENT = 50;

async function persistChunksWithEmbeddings(input: {
  sourceId: string;
  agentId: string;
  content: string;
  now?: Date;
}) {
  const chunks = chunkText(input.content);
  if (chunks.length === 0) return;

  let embeddings: number[][] = [];
  try {
    embeddings = await generateEmbeddings(chunks);
  } catch (error) {
    console.warn("Failed to generate embeddings:", error);
  }

  await insertKnowledgeChunks({
    sourceId: input.sourceId,
    agentId: input.agentId,
    now: input.now,
    chunks: chunks.map((chunk, index) => ({
      text: chunk,
      embedding: embeddings[index] ? `[${embeddings[index].join(",")}]` : null,
    })),
  });
}

export async function createKnowledgeSource(input: { agentId: string; title: string; content: string }) {
  const total = await countKnowledgeSourcesByAgentId(input.agentId);
  if (total >= MAX_KNOWLEDGE_SOURCES_PER_AGENT) {
    return { ok: false as const, error: "Knowledge source limit reached" };
  }

  const { sourceId, now } = await createKnowledgeSourceRecord(input);
  await persistChunksWithEmbeddings({ sourceId, agentId: input.agentId, content: input.content, now });

  return { ok: true as const, sourceId };
}

export async function updateKnowledgeSource(input: {
  id: string;
  agentId: string;
  title: string;
  content: string;
}) {
  const existing = await getKnowledgeSourceByIdAndAgent({ id: input.id, agentId: input.agentId });
  if (!existing) {
    return { ok: false as const, error: "Knowledge source not found" };
  }

  const now = new Date();
  await updateKnowledgeSourceRecord({ id: input.id, agentId: input.agentId, title: input.title, content: input.content, now });
  await deleteKnowledgeChunksBySourceId(input.id);
  await persistChunksWithEmbeddings({ sourceId: input.id, agentId: input.agentId, content: input.content, now });

  return { ok: true as const };
}

export async function hybridSearchKnowledgeByAgentId(
  agentId: string,
  query: string,
  limit = 5
): Promise<string[]> {
  if (!query.trim()) {
    return getRecentKnowledgeChunksByAgentId(agentId, limit);
  }

  let queryEmbedding: number[];
  try {
    queryEmbedding = await generateEmbedding(query);
  } catch (error) {
    console.warn("Failed to generate embedding, falling back to recency:", error);
    return getRecentKnowledgeChunksByAgentId(agentId, limit);
  }

  try {
    const rows = await getKnowledgeChunksForSearch(agentId, 30);
    if (rows.length === 0) {
      return [];
    }

    const maxDate = Math.max(...rows.map((row) => new Date(row.createdAt).getTime()));
    const minDate = Math.min(...rows.map((row) => new Date(row.createdAt).getTime()));

    const scoredChunks = rows
      .map((row) => {
        let semanticScore = 0;

        if (row.embedding) {
          try {
            semanticScore = cosineSimilarity(queryEmbedding, JSON.parse(row.embedding));
          } catch {
            semanticScore = 0;
          }
        }

        const createdTime = new Date(row.createdAt).getTime();
        const recencyScore = (createdTime - minDate) / (maxDate - minDate + 1);
        const combinedScore = semanticScore * 0.7 + recencyScore * 0.3;

        return { chunkText: row.chunkText, score: combinedScore };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scoredChunks.map((chunk) => chunk.chunkText);
  } catch {
    return getRecentKnowledgeChunksByAgentId(agentId, limit);
  }
}

export async function backfillEmbeddingsForAgent(agentId: string): Promise<number> {
  const chunks = await getKnowledgeChunksWithoutEmbeddings(agentId);
  if (chunks.length === 0) {
    return 0;
  }

  let embeddings: number[][] = [];
  try {
    embeddings = await generateEmbeddings(chunks.map((chunk) => chunk.chunkText));
  } catch (error) {
    console.warn("Failed to generate embeddings for backfill:", error);
    return 0;
  }

  let updated = 0;
  for (let index = 0; index < chunks.length; index++) {
    if (!embeddings[index]) continue;

    await updateChunkEmbedding({
      chunkId: chunks[index].id,
      embedding: `[${embeddings[index].join(",")}]`,
    });
    updated++;
  }

  return updated;
}
