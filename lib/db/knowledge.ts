import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { agents, knowledgeChunks, knowledgeSources, portfolios } from "@/lib/schema";
import { chunkText } from "@/lib/knowledge/chunk-text";
import { generateEmbedding, generateEmbeddings, cosineSimilarity } from "@/lib/ai/embeddings";

const MAX_KNOWLEDGE_SOURCES_PER_AGENT = 50;

export interface KnowledgeSourceRecord {
  id: string;
  agentId: string;
  title: string;
  type: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  chunkCount: number;
}

export async function getUserAgent(userId: string) {
  const [agent] = await db
    .select({
      id: agents.id,
      portfolioId: agents.portfolioId,
      isEnabled: agents.isEnabled,
    })
    .from(agents)
    .innerJoin(portfolios, eq(portfolios.id, agents.portfolioId))
    .where(eq(portfolios.userId, userId))
    .limit(1);

  return agent ?? null;
}

export async function listKnowledgeSourcesByAgentId(agentId: string): Promise<KnowledgeSourceRecord[]> {
  const rows = await db
    .select({
      id: knowledgeSources.id,
      agentId: knowledgeSources.agentId,
      title: knowledgeSources.title,
      type: knowledgeSources.type,
      content: knowledgeSources.content,
      createdAt: knowledgeSources.createdAt,
      updatedAt: knowledgeSources.updatedAt,
    })
    .from(knowledgeSources)
    .where(eq(knowledgeSources.agentId, agentId))
    .orderBy(desc(knowledgeSources.updatedAt));

  const withCounts = await Promise.all(
    rows.map(async (row) => {
      const [chunkStats] = await db
        .select({ total: count(knowledgeChunks.id) })
        .from(knowledgeChunks)
        .where(eq(knowledgeChunks.sourceId, row.id));

      return {
        ...row,
        chunkCount: Number(chunkStats?.total ?? 0),
      };
    })
  );

  return withCounts;
}

export async function createKnowledgeSource(input: { agentId: string; title: string; content: string }) {
  const [sourceCount] = await db
    .select({ total: count(knowledgeSources.id) })
    .from(knowledgeSources)
    .where(eq(knowledgeSources.agentId, input.agentId));

  if (Number(sourceCount?.total ?? 0) >= MAX_KNOWLEDGE_SOURCES_PER_AGENT) {
    return { ok: false as const, error: "Knowledge source limit reached" };
  }

  const sourceId = crypto.randomUUID();
  const chunks = chunkText(input.content);
  const now = new Date();

  await db.insert(knowledgeSources).values({
    id: sourceId,
    agentId: input.agentId,
    title: input.title,
    type: "text",
    content: input.content,
    createdAt: now,
    updatedAt: now,
  });

  if (chunks.length > 0) {
    let embeddings: number[][] = [];
    try {
      embeddings = await generateEmbeddings(chunks);
    } catch (error) {
      console.warn("Failed to generate embeddings:", error);
    }
    
    await db.insert(knowledgeChunks).values(
      chunks.map((chunk, index) => ({
        id: crypto.randomUUID(),
        sourceId,
        agentId: input.agentId,
        chunkText: chunk,
        embedding: embeddings[index] ? `[${embeddings[index].join(",")}]` : null,
        createdAt: now,
      }))
    );
  }

  return { ok: true as const, sourceId };
}

export async function updateKnowledgeSource(input: {
  id: string;
  agentId: string;
  title: string;
  content: string;
}) {
  const [existing] = await db
    .select({ id: knowledgeSources.id })
    .from(knowledgeSources)
    .where(and(eq(knowledgeSources.id, input.id), eq(knowledgeSources.agentId, input.agentId)))
    .limit(1);

  if (!existing) {
    return { ok: false as const, error: "Knowledge source not found" };
  }

  const chunks = chunkText(input.content);
  const now = new Date();

  await db
    .update(knowledgeSources)
    .set({ title: input.title, content: input.content, updatedAt: now })
    .where(eq(knowledgeSources.id, input.id));

  await db.delete(knowledgeChunks).where(eq(knowledgeChunks.sourceId, input.id));

  if (chunks.length > 0) {
    let embeddings: number[][] = [];
    try {
      embeddings = await generateEmbeddings(chunks);
    } catch (error) {
      console.warn("Failed to generate embeddings:", error);
    }
    
    await db.insert(knowledgeChunks).values(
      chunks.map((chunk, index) => ({
        id: crypto.randomUUID(),
        sourceId: input.id,
        agentId: input.agentId,
        chunkText: chunk,
        embedding: embeddings[index] ? `[${embeddings[index].join(",")}]` : null,
        createdAt: now,
      }))
    );
  }

  return { ok: true as const };
}

export async function deleteKnowledgeSource(input: { id: string; agentId: string }) {
  const deleted = await db
    .delete(knowledgeSources)
    .where(and(eq(knowledgeSources.id, input.id), eq(knowledgeSources.agentId, input.agentId)))
    .returning({ id: knowledgeSources.id });

  return deleted.length > 0;
}

export async function getRecentKnowledgeChunksByAgentId(agentId: string, limit = 3): Promise<string[]> {
  const rows = await db
    .select({ chunkText: knowledgeChunks.chunkText })
    .from(knowledgeChunks)
    .where(eq(knowledgeChunks.agentId, agentId))
    .orderBy(desc(knowledgeChunks.createdAt))
    .limit(limit);

  return rows.map((row) => row.chunkText);
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
    const rows = await db
      .select({
        id: knowledgeChunks.id,
        chunkText: knowledgeChunks.chunkText,
        embedding: knowledgeChunks.embedding,
        createdAt: knowledgeChunks.createdAt,
      })
      .from(knowledgeChunks)
      .where(eq(knowledgeChunks.agentId, agentId))
      .limit(30);

    if (rows.length === 0) {
      return [];
    }

    const maxDate = Math.max(...rows.map((r) => new Date(r.createdAt).getTime()));
    const minDate = Math.min(...rows.map((r) => new Date(r.createdAt).getTime()));

    const scoredChunks = rows
      .map((row) => {
        let semanticScore = 0;
        let recencyScore = 0;

        if (row.embedding) {
          try {
            const storedEmbedding = JSON.parse(row.embedding);
            semanticScore = cosineSimilarity(queryEmbedding, storedEmbedding);
          } catch {
            semanticScore = 0;
          }
        }

        const createdTime = new Date(row.createdAt).getTime();
        recencyScore = (createdTime - minDate) / (maxDate - minDate + 1);

        const combinedScore = semanticScore * 0.7 + recencyScore * 0.3;
        return { chunkText: row.chunkText, score: combinedScore };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scoredChunks.map((c) => c.chunkText);
  } catch {
    return getRecentKnowledgeChunksByAgentId(agentId, limit);
  }
}

export async function backfillEmbeddingsForAgent(agentId: string): Promise<number> {
  const chunks = await db
    .select({
      id: knowledgeChunks.id,
      chunkText: knowledgeChunks.chunkText,
    })
    .from(knowledgeChunks)
    .where(and(eq(knowledgeChunks.agentId, agentId), sql`${knowledgeChunks.embedding} IS NULL`));

  if (chunks.length === 0) {
    return 0;
  }

  const texts = chunks.map((c) => c.chunkText);
  let embeddings: number[][] = [];
  try {
    embeddings = await generateEmbeddings(texts);
  } catch (error) {
    console.warn("Failed to generate embeddings for backfill:", error);
    return 0;
  }

  let updated = 0;
  for (let i = 0; i < chunks.length; i++) {
    if (embeddings[i]) {
      await db
        .update(knowledgeChunks)
        .set({ embedding: `[${embeddings[i].join(",")}]` })
        .where(eq(knowledgeChunks.id, chunks[i].id));
      updated++;
    }
  }

  return updated;
}

export async function getPublicAgentById(agentId: string) {
  const [row] = await db
    .select({
      agentId: agents.id,
      isEnabled: agents.isEnabled,
      portfolioHandle: portfolios.handle,
      portfolioIsPublished: portfolios.isPublished,
    })
    .from(agents)
    .innerJoin(portfolios, eq(portfolios.id, agents.portfolioId))
    .where(eq(agents.id, agentId))
    .limit(1);

  return row ?? null;
}
