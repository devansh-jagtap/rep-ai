import { hasFailureSpike, hasModelMisconfigurationSpike } from "@/lib/db/ai-telemetry";

export const AI_ALERT_THRESHOLDS = {
  failureSpike: {
    lookbackMinutes: 15,
    minEvents: 20,
    failureRateThreshold: 0.25,
  },
  modelMisconfiguration: {
    lookbackMinutes: 30,
    minEvents: 10,
  },
} as const;

export interface AiAlertStatus {
  failureSpikeDetected: boolean;
  modelMisconfigurationDetected: boolean;
}

export async function getAiAlertStatus(): Promise<AiAlertStatus> {
  const [failureSpikeDetected, modelMisconfigurationDetected] = await Promise.all([
    hasFailureSpike(AI_ALERT_THRESHOLDS.failureSpike),
    hasModelMisconfigurationSpike(
      AI_ALERT_THRESHOLDS.modelMisconfiguration.lookbackMinutes,
      AI_ALERT_THRESHOLDS.modelMisconfiguration.minEvents
    ),
  ]);

  return {
    failureSpikeDetected,
    modelMisconfigurationDetected,
  };
}
