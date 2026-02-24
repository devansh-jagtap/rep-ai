import { beforeEach, describe, expect, it, mock } from "bun:test";

const requireUserId = mock(() => Promise.resolve({ ok: true as const, userId: "user-1" }));
const parseJsonBody = mock((request: Request) => request.json().then((body) => ({ ok: true as const, body })));
const parseKnowledgeInput = mock((body: Record<string, unknown>) => ({
  title: String(body.title ?? ""),
  content: String(body.content ?? ""),
}));
const getUserAgent = mock(() => Promise.resolve({ id: "agent-1" }));
const listKnowledgeSourcesByAgentId = mock(() => Promise.resolve([]));
const createKnowledgeSource = mock(() => Promise.resolve({ ok: true as const, sourceId: "source-1" }));

mock.module("@/lib/api/route-helpers", () => ({ requireUserId, parseJsonBody }));
mock.module("@/lib/validation/knowledge", () => ({ parseKnowledgeInput }));
mock.module("@/lib/db/knowledge", () => ({ getUserAgent, listKnowledgeSourcesByAgentId }));
mock.module("@/lib/knowledge/service", () => ({ createKnowledgeSource }));

const routeModule = await import("@/app/api/knowledge/route");

describe("knowledge api route", () => {
  beforeEach(() => {
    requireUserId.mockClear();
    parseJsonBody.mockClear();
    parseKnowledgeInput.mockClear();
    getUserAgent.mockClear();
    createKnowledgeSource.mockClear();
  });

  it("POST wires through knowledge service and returns created id", async () => {
    const request = new Request("http://localhost/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "FAQ", content: "Knowledge text" }),
    });

    const response = await routeModule.POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ success: true, id: "source-1" });
    expect(getUserAgent).toHaveBeenCalledWith("user-1");
    expect(createKnowledgeSource).toHaveBeenCalledWith({
      agentId: "agent-1",
      title: "FAQ",
      content: "Knowledge text",
    });
  });
});
