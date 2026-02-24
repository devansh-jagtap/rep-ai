import OpenAI from "openai";

// Embeddings use Token Factory API. See: https://api.tokenfactory.nebius.com/docs
const NEBIUS_EMBEDDING_BASE_URL =
  process.env.NEBIUS_EMBEDDING_BASE_URL || "https://api.tokenfactory.nebius.com/v1/";
const NEBIUS_API_KEY = process.env.NEBIUS_API_KEY;

export const embeddingClient = new OpenAI({
  apiKey: NEBIUS_API_KEY,
  baseURL: NEBIUS_EMBEDDING_BASE_URL,
});

export const EMBEDDING_MODEL = "Qwen/Qwen3-Embedding-8B";
export const EMBEDDING_DIMENSIONS = 4096;

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text.trim()) {
    return Array(EMBEDDING_DIMENSIONS).fill(0);
  }

  try {
    const response = await embeddingClient.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.slice(0, 8000),
      dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.warn("Embedding generation failed:", error);
    throw error;
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const filteredTexts = texts.filter((t) => t.trim());
  if (filteredTexts.length === 0) {
    return [];
  }

  try {
    const response = await embeddingClient.embeddings.create({
      model: EMBEDDING_MODEL,
      input: filteredTexts.map((t) => t.slice(0, 8000)),
      dimensions: EMBEDDING_DIMENSIONS,
    });

    const embeddings = response.data.sort((a: { index: number }, b: { index: number }) => a.index - b.index);
    return embeddings.map((e: { embedding: number[] }) => e.embedding);
  } catch (error) {
    console.warn("Embeddings generation failed:", error);
    throw error;
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
