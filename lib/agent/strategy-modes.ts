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

export function isConversationStrategyMode(value: string): value is ConversationStrategyMode {
  return value in CONVERSATION_STRATEGY_MODES;
}

export function leadConfidenceThresholdForMode(mode: ConversationStrategyMode): number {
  switch (mode) {
    case "passive":
      return 101;
    case "consultative":
      return 70;
    case "sales":
      return 50;
    default:
      return 60;
  }
}

