ALTER TABLE "knowledge_chunks" ADD COLUMN "embedding" text;
CREATE INDEX IF NOT EXISTS "knowledge_chunks_embedding_idx" ON "knowledge_chunks" USING gin (to_tsvector('english', "embedding"));
