import { describe, expect, it } from "bun:test";
import { buildPrompt } from "@/lib/ai/generate-agent-reply/prompt-builder";
import { composeContext } from "@/lib/ai/generate-agent-reply/context-preparation";
import type { GenerateAgentReplyInput } from "@/lib/ai/generate-agent-reply/types";

function baseInput(overrides: Partial<GenerateAgentReplyInput> = {}): GenerateAgentReplyInput {
  return {
    agentId: "agent-1",
    model: "gpt-4o-mini",
    temperature: 0.5,
    behaviorType: null,
    strategyMode: "consultative",
    customPrompt: null,
    message: "Can you help me?",
    history: [],
    portfolio: null,
    ...overrides,
  };
}

describe("composeContext", () => {
  it("preserves deterministic priority and truncates knowledge by budget", () => {
    const input = baseInput({
      history: Array.from({ length: 8 }).map((_, i) => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: `History entry ${i + 1} ${"x".repeat(600)}`,
      })),
      portfolio: {
        hero: { headline: "Senior Engineer", subheadline: "Building products", ctaText: "Book a call" },
        about: { paragraph: "About me" },
        services: [],
        projects: [],
        cta: { headline: "Let's talk", subtext: "Reach out anytime" },
        socialLinks: [],
        visibleSections: ["hero", "about", "services", "projects", "cta"],
      },
    });

    const chunks = [
      { chunkId: "c1", sourceId: "s1", content: "A".repeat(4_000) },
      { chunkId: "c2", sourceId: "s2", content: "B".repeat(4_000) },
    ];

    const context = composeContext(input, chunks);

    expect(context.history).toHaveLength(8);
    expect(context.knowledgeChunks.length).toBeGreaterThan(0);
    expect(context.knowledgeChunks[0].chunkId).toBe("c1");
    expect(context.knowledgeChunks[0].sourceId).toBe("s1");
    expect(context.knowledgeChunks[0].content.length).toBeLessThanOrEqual(4_000);

    if (context.knowledgeChunks[1]) {
      expect(context.knowledgeChunks[1].content.endsWith("...")).toBe(true);
    }
  });

  it("marks sparse context when history/knowledge/portfolio are absent", () => {
    const input = baseInput({ history: [{ role: "user", content: "Hi" }] });
    const context = composeContext(input, []);

    expect(context.isContextSparse).toBe(true);
    expect(context.knowledgeChunks).toHaveLength(0);
  });
});

describe("buildPrompt", () => {
  it("renders context tiers with source metadata and sparse guardrail", () => {
    const input = baseInput();
    const context = composeContext(input, []);

    const prompt = buildPrompt(input, context);

    expect(prompt).toContain("CONTEXT TIERS (highest priority first)");
    expect(prompt).toContain("1) Recent conversation");
    expect(prompt).toContain("2) Knowledge chunks");
    expect(prompt).toContain("3) Profile metadata");
    expect(prompt).toContain("4) Optional portfolio sections");
    expect(prompt).toContain("SPARSE CONTEXT GUARDRAIL");
  });

  it("includes chunk/source ids in knowledge section", () => {
    const input = baseInput();
    const context = composeContext(input, [
      { chunkId: "chunk-42", sourceId: "source-9", content: "Reference content" },
    ]);

    const prompt = buildPrompt(input, context);

    expect(prompt).toContain("chunk_id=chunk-42");
    expect(prompt).toContain("source_id=source-9");
  });
});
