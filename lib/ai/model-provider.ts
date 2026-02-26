import { createOpenAI } from "@ai-sdk/openai";

const nebius = createOpenAI({
  apiKey: process.env.NEBIUS_API_KEY,
  baseURL: process.env.NEBIUS_BASE_URL ?? "https://api.studio.nebius.com/v1",
});

const gateway = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: process.env.AI_GATEWAY_BASE_URL ?? "https://ai-gateway.vercel.sh/v1",
});

const gatewayModels = new Set(["google/gemini-3-flash", "openai/gpt-5-mini"]);

export function resolveChatModel(model: string) {
  if (gatewayModels.has(model)) {
    return gateway.chat(model);
  }

  return nebius.chat(model);
}

