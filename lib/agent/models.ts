export const SUPPORTED_AGENT_MODELS = [
  "moonshotai/Kimi-K2.5",
  "MiniMaxAI/MiniMax-M2.1",
  "zai-org/GLM-4.7-FP8",
  "openai/gpt-oss-120b",
] as const;

export type SupportedAgentModel = (typeof SUPPORTED_AGENT_MODELS)[number];

export function isSupportedAgentModel(model: string): model is SupportedAgentModel {
  return SUPPORTED_AGENT_MODELS.includes(model as SupportedAgentModel);
}
