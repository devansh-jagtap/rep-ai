import { describe, expect, it } from "bun:test";

describe("knowledge layering boundaries", () => {
  it("keeps db layer free of embedding/search orchestration imports", async () => {
    const dbKnowledge = await Bun.file("lib/db/knowledge.ts").text();

    expect(dbKnowledge).not.toContain("@/lib/ai/embeddings");
    expect(dbKnowledge).not.toContain("@/lib/knowledge/chunk-text");
  });

  it("places embedding/search orchestration in knowledge service layer", async () => {
    const knowledgeService = await Bun.file("lib/knowledge/service.ts").text();

    expect(knowledgeService).toContain("@/lib/ai/embeddings");
    expect(knowledgeService).toContain("@/lib/knowledge/chunk-text");
  });
});
