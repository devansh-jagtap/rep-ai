export const CONVERSATION_STRATEGY_MODES = {
  passive: {
    label: "Passive",
    description: "Only answers questions. Never qualifies or captures leads unless explicitly asked.",
  },
  consultative: {
    label: "Consultative",
    description: "Asks clarifying questions to help. Captures leads when intent is clear.",
  },
  sales: {
    label: "Sales",
    description: "Actively qualifies budget + timeline and pushes to a next step.",
  },
} as const;

export type ConversationStrategyMode = keyof typeof CONVERSATION_STRATEGY_MODES;

const LEAD_CONFIDENCE_BASELINE: Record<ConversationStrategyMode, number> = {
  passive: 101,
  consultative: 70,
  sales: 50,
};

const INDUSTRY_CONFIDENCE_DELTAS: Record<string, Partial<Record<ConversationStrategyMode, number>>> = {
  legal: { consultative: 6, sales: 8 },
  healthcare: { consultative: 8, sales: 10 },
  finance: { consultative: 7, sales: 9 },
  enterprise: { consultative: 5, sales: 6 },
  default: { consultative: 0, sales: 0, passive: 0 },
};

export function isConversationStrategyMode(value: string): value is ConversationStrategyMode {
  return value in CONVERSATION_STRATEGY_MODES;
}

export function normalizeIndustryType(industryType: string | null | undefined): string {
  const normalized = industryType?.trim().toLowerCase();

  if (!normalized) {
    return "default";
  }

  if (
    normalized.includes("law") ||
    normalized.includes("legal") ||
    normalized.includes("attorney")
  ) {
    return "legal";
  }

  if (
    normalized.includes("health") ||
    normalized.includes("medical") ||
    normalized.includes("clinic")
  ) {
    return "healthcare";
  }

  if (
    normalized.includes("finance") ||
    normalized.includes("bank") ||
    normalized.includes("investment")
  ) {
    return "finance";
  }

  if (normalized.includes("enterprise") || normalized.includes("b2b")) {
    return "enterprise";
  }

  return "default";
}

export function leadConfidenceThresholdForMode(
  mode: ConversationStrategyMode,
  industryType?: string | null
): number {
  const industryKey = normalizeIndustryType(industryType);
  const baseline = LEAD_CONFIDENCE_BASELINE[mode] ?? 60;
  const delta = INDUSTRY_CONFIDENCE_DELTAS[industryKey]?.[mode] ?? 0;

  return baseline + delta;
}
