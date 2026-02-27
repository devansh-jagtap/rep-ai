import type { BehaviorPresetType } from "@/lib/agent/behavior-presets";
import type { AgentMessage } from "@/lib/ai/generate-agent-reply";
import type { ConversationStrategyMode } from "@/lib/agent/strategy-modes";

export interface EvalFixture {
  id: string;
  niche: string;
  strategyMode: ConversationStrategyMode;
  behaviorType: BehaviorPresetType;
  message: string;
  history: AgentMessage[];
  expected: {
    leadDetected: boolean;
    tone: "friendly" | "professional" | "sales" | "minimal";
    policy: {
      disallowQualificationPrompt?: boolean;
      requireNextStepPrompt?: boolean;
      disallowPromptLeak?: boolean;
    };
  };
}

export interface EvalMetricSet {
  leadPrecision: number;
  leadRecall: number;
  policyAdherence: number;
  toneConsistency: number;
}

export interface EvalThreshold {
  minimums: EvalMetricSet;
  regressionTolerance: EvalMetricSet;
  baseline: EvalMetricSet;
}
