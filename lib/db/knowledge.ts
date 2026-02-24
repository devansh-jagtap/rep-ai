import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agents, knowledgeChunks, knowledgeSources, portfolios } from "@/lib/schema";

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
      chunkCount: count(knowledgeChunks.id),
    })
    .from(knowledgeSources)
    .leftJoin(knowledgeChunks, eq(knowledgeChunks.sourceId, knowledgeSources.id))
    .where(eq(knowledgeSources.agentId, agentId))
    .groupBy(
      knowledgeSources.id,
      knowledgeSources.agentId,
      knowledgeSources.title,
      knowledgeSources.type,
      knowledgeSources.content,
      knowledgeSources.createdAt,
      knowledgeSources.updatedAt
    )
    .orderBy(desc(knowledgeSources.updatedAt));

  return rows.map((row) => ({ ...row, chunkCount: Number(row.chunkCount ?? 0) }));
}

export async function countKnowledgeSourcesByAgentId(agentId: string): Promise<number> {
  const [row] = await db
    .select({ total: count(knowledgeSources.id) })
    .from(knowledgeSources)
    .where(eq(knowledgeSources.agentId, agentId));

  return Number(row?.total ?? 0);
}

export async function createKnowledgeSourceRecord(input: {
  agentId: string;
  title: string;
  content: string;
  now?: Date;
}) {
  const id = crypto.randomUUID();
  const now = input.now ?? new Date();

  await db.insert(knowledgeSources).values({
    id,
    agentId: input.agentId,
    title: input.title,
    type: "text",
    content: input.content,
    createdAt: now,
    updatedAt: now,
  });

  return { id, now };
}

export async function getKnowledgeSourceByIdAndAgent(input: { id: string; agentId: string }) {
  const [existing] = await db
    .select({ id: knowledgeSources.id })
    .from(knowledgeSources)
    .where(and(eq(knowledgeSources.id, input.id), eq(knowledgeSources.agentId, input.agentId)))
    .limit(1);

  return existing ?? null;
}

export async function updateKnowledgeSourceRecord(input: {
  id: string;
  title: string;
  content: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();

  await db
    .update(knowledgeSources)
    .set({ title: input.title, content: input.content, updatedAt: now })
    .where(eq(knowledgeSources.id, input.id));
}

export async function deleteKnowledgeSource(input: { id: string; agentId: string }) {
  const deleted = await db
    .delete(knowledgeSources)
    .where(and(eq(knowledgeSources.id, input.id), eq(knowledgeSources.agentId, input.agentId)))
    .returning({ id: knowledgeSources.id });

  return deleted.length > 0;
}

export async function deleteKnowledgeChunksBySourceId(sourceId: string) {
  await db.delete(knowledgeChunks).where(eq(knowledgeChunks.sourceId, sourceId));
}

export async function insertKnowledgeChunks(input: {
  sourceId: string;
  agentId: string;
  chunks: Array<{ text: string; embedding: string | null }>;
  now?: Date;
}) {
  if (input.chunks.length === 0) return;

  const now = input.now ?? new Date();
  await db.insert(knowledgeChunks).values(
    input.chunks.map((chunk) => ({
      id: crypto.randomUUID(),
      sourceId: input.sourceId,
      agentId: input.agentId,
      chunkText: chunk.text,
      embedding: chunk.embedding,
      createdAt: now,
    }))
  );
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

export async function getKnowledgeChunksForSearch(agentId: string, limit = 30) {
  return db
    .select({
      id: knowledgeChunks.id,
      chunkText: knowledgeChunks.chunkText,
      embedding: knowledgeChunks.embedding,
      createdAt: knowledgeChunks.createdAt,
    })
    .from(knowledgeChunks)
    .where(eq(knowledgeChunks.agentId, agentId))
    .limit(limit);
}

export async function getKnowledgeChunksWithoutEmbeddings(agentId: string) {
  return db
    .select({
      id: knowledgeChunks.id,
      chunkText: knowledgeChunks.chunkText,
    })
    .from(knowledgeChunks)
    .where(and(eq(knowledgeChunks.agentId, agentId), eq(knowledgeChunks.embedding, null)));
}

export async function updateChunkEmbedding(input: { chunkId: string; embedding: string }) {
  await db
    .update(knowledgeChunks)
    .set({ embedding: input.embedding })
    .where(eq(knowledgeChunks.id, input.chunkId));
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
