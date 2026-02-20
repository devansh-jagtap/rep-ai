import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getPortfolioByUserId } from "@/lib/db/portfolio";
import { agents } from "@/lib/schema";
import { isBehaviorPresetType } from "@/lib/agent/behavior-presets";
import { isSupportedAgentModel } from "@/lib/agent/models";

export interface ConfigureAgentInput {
  isEnabled: boolean;
  model: string;
  behaviorType: string | null;
  customPrompt: string | null;
  temperature: number;
}

export function validateConfigureAgentInput(input: ConfigureAgentInput) {
  if (!isSupportedAgentModel(input.model)) {
    return { ok: false as const, error: "Invalid model selection" };
  }

  const trimmedPrompt = input.customPrompt?.trim() ?? "";
  const normalizedPrompt = trimmedPrompt.length > 0 ? trimmedPrompt : null;

  if (input.behaviorType && !isBehaviorPresetType(input.behaviorType)) {
    return { ok: false as const, error: "Invalid behavior preset" };
  }

  if (!input.behaviorType && !normalizedPrompt) {
    return {
      ok: false as const,
      error: "Select a behavior preset or provide a custom prompt",
    };
  }

  if (Number.isNaN(input.temperature) || input.temperature < 0.2 || input.temperature > 0.8) {
    return { ok: false as const, error: "Temperature must be between 0.2 and 0.8" };
  }

  return {
    ok: true as const,
    value: {
      isEnabled: input.isEnabled,
      model: input.model,
      behaviorType: input.behaviorType,
      customPrompt: normalizedPrompt,
      temperature: Number(input.temperature.toFixed(2)),
    },
  };
}

export async function getAgentByPortfolioId(portfolioId: string) {
  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.portfolioId, portfolioId))
    .limit(1);

  return agent ?? null;
}

export async function configureAgentForUser(userId: string, input: ConfigureAgentInput) {
  const portfolio = await getPortfolioByUserId(userId);
  if (!portfolio) {
    return { ok: false as const, status: 404, error: "Portfolio not found" };
  }

  const validation = validateConfigureAgentInput(input);
  if (!validation.ok) {
    return { ok: false as const, status: 400, error: validation.error };
  }

  await db
    .insert(agents)
    .values({
      id: crypto.randomUUID(),
      portfolioId: portfolio.id,
      isEnabled: validation.value.isEnabled,
      model: validation.value.model,
      behaviorType: validation.value.behaviorType,
      customPrompt: validation.value.customPrompt,
      temperature: validation.value.temperature,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: agents.portfolioId,
      set: {
        isEnabled: validation.value.isEnabled,
        model: validation.value.model,
        behaviorType: validation.value.behaviorType,
        customPrompt: validation.value.customPrompt,
        temperature: validation.value.temperature,
        updatedAt: new Date(),
      },
    });

  return { ok: true as const };
}
