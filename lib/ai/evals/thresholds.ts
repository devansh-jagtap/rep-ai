import type { ConversationStrategyMode } from "@/lib/agent/strategy-modes";
import type { EvalThreshold } from "@/lib/ai/evals/types";

export const EVAL_THRESHOLDS: Record<ConversationStrategyMode, EvalThreshold> = {
  passive: {
    minimums: {
      leadPrecision: 0.95,
      leadRecall: 0.8,
      policyAdherence: 0.95,
      toneConsistency: 0.8,
    },
    regressionTolerance: {
      leadPrecision: 0.05,
      leadRecall: 0.1,
      policyAdherence: 0.05,
      toneConsistency: 0.1,
    },
    baseline: {
      leadPrecision: 1,
      leadRecall: 1,
      policyAdherence: 1,
      toneConsistency: 0.9,
    },
  },
  consultative: {
    minimums: {
      leadPrecision: 0.7,
      leadRecall: 0.75,
      policyAdherence: 0.85,
      toneConsistency: 0.75,
    },
    regressionTolerance: {
      leadPrecision: 0.15,
      leadRecall: 0.15,
      policyAdherence: 0.1,
      toneConsistency: 0.15,
    },
    baseline: {
      leadPrecision: 0.85,
      leadRecall: 0.85,
      policyAdherence: 0.95,
      toneConsistency: 0.85,
    },
  },
  sales: {
    minimums: {
      leadPrecision: 0.7,
      leadRecall: 0.8,
      policyAdherence: 0.8,
      toneConsistency: 0.7,
    },
    regressionTolerance: {
      leadPrecision: 0.15,
      leadRecall: 0.1,
      policyAdherence: 0.1,
      toneConsistency: 0.15,
    },
    baseline: {
      leadPrecision: 0.85,
      leadRecall: 0.9,
      policyAdherence: 0.9,
      toneConsistency: 0.8,
    },
  },
};
