import { db } from "@/lib/db";
import { knowledgeSources, knowledgeChunks } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { extractTextFromPdf, extractTextFromUrl } from "@/lib/knowledge/extract-pdf";
import { generateEmbeddings } from "@/lib/ai/embeddings";
import { chunkText } from "@/lib/knowledge/chunk-text";
import { insertKnowledgeChunks, deleteKnowledgeChunksBySourceId } from "@/lib/db/knowledge";
import { getKeyFromUrl, getFileBuffer } from "@/lib/storage/s3";

export type ProcessingStatus = "pending" | "processing" | "complete" | "failed";

export async function updateKnowledgeSourceStatus(
  sourceId: string,
  status: ProcessingStatus,
  error?: string
): Promise<void> {
  await db
    .update(knowledgeSources)
    .set({
      status,
      ...(error && { content: error }),
    })
    .where(eq(knowledgeSources.id, sourceId));
}

export async function processKnowledgeSource(sourceId: string): Promise<{ success: boolean; error?: string }> {
  const [source] = await db
    .select({
      id: knowledgeSources.id,
      agentId: knowledgeSources.agentId,
      fileUrl: knowledgeSources.fileUrl,
      mimeType: knowledgeSources.mimeType,
      content: knowledgeSources.content,
    })
    .from(knowledgeSources)
    .where(eq(knowledgeSources.id, sourceId))
    .limit(1);

  if (!source) {
    return { success: false, error: "Source not found" };
  }

  try {
    await updateKnowledgeSourceStatus(sourceId, "processing");

    let content = source.content;

    if (source.fileUrl && source.mimeType === "application/pdf") {
      const s3Key = getKeyFromUrl(source.fileUrl);
      const extraction = s3Key
        ? await extractTextFromPdf(await getFileBuffer(s3Key))
        : await extractTextFromUrl(source.fileUrl);
      content = extraction.text;

      await db
        .update(knowledgeSources)
        .set({ content, updatedAt: new Date() })
        .where(eq(knowledgeSources.id, sourceId));
    }

    await deleteKnowledgeChunksBySourceId(sourceId);

    const chunks = chunkText(content);
    if (chunks.length === 0) {
      await updateKnowledgeSourceStatus(sourceId, "complete");
      return { success: true };
    }

    let embeddings: number[][] = [];
    try {
      embeddings = await generateEmbeddings(chunks);
    } catch (error) {
      console.warn("Failed to generate embeddings:", error);
    }

    await insertKnowledgeChunks({
      sourceId: sourceId,
      agentId: source.agentId,
      chunks: chunks.map((chunk, index) => ({
        text: chunk,
        embedding: embeddings[index] ? `[${embeddings[index].join(",")}]` : null,
      })),
    });

    await updateKnowledgeSourceStatus(sourceId, "complete");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await updateKnowledgeSourceStatus(sourceId, "failed", errorMessage);
    return { success: false, error: errorMessage };
  }
}
