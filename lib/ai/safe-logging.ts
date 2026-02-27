import { storeAiTelemetryEvent } from "@/lib/db/ai-telemetry";

export type TelemetryLatencyBucket = "lt_1s" | "1s_to_3s" | "3s_to_7s" | "gte_7s" | "unknown";

export interface PublicAgentLogEvent {
  handle: string;
  agentId?: string | null;
  portfolioId?: string | null;
  sessionId: string;
  model: string;
  mode: string;
  tokensUsed: number;
  leadDetected: boolean;
  confidence: number;
  success: boolean;
  fallbackReason?: string | null;
  latencyMs?: number | null;
  creditCost?: number;
  metadata?: Record<string, unknown> | null;
}

export function latencyBucketForMs(latencyMs?: number | null): TelemetryLatencyBucket {
  if (typeof latencyMs !== "number" || !Number.isFinite(latencyMs) || latencyMs < 0) {
    return "unknown";
  }

  if (latencyMs < 1_000) return "lt_1s";
  if (latencyMs < 3_000) return "1s_to_3s";
  if (latencyMs < 7_000) return "3s_to_7s";
  return "gte_7s";
}

export async function logPublicAgentEvent(event: PublicAgentLogEvent): Promise<void> {
  const latencyBucket = latencyBucketForMs(event.latencyMs);

  const payload = {
    event: "public_agent_response",
    handle: event.handle,
    agent_id: event.agentId ?? null,
    portfolio_id: event.portfolioId ?? null,
    session_id: event.sessionId,
    model: event.model,
    mode: event.mode,
    tokens_used: event.tokensUsed,
    lead_detected: event.leadDetected,
    confidence: event.confidence,
    success: event.success,
    fallback_reason: event.fallbackReason ?? null,
    latency_ms: event.latencyMs ?? null,
    latency_bucket: latencyBucket,
    credit_cost: event.creditCost ?? 0,
    metadata: event.metadata ?? null,
    timestamp: new Date().toISOString(),
  };

  console.info(JSON.stringify(payload));

  try {
    await storeAiTelemetryEvent({
      handle: event.handle,
      agentId: event.agentId ?? null,
      portfolioId: event.portfolioId ?? null,
      sessionId: event.sessionId,
      eventType: "public_agent_response",
      model: event.model,
      mode: event.mode,
      tokensUsed: event.tokensUsed,
      leadDetected: event.leadDetected,
      success: event.success,
      fallbackReason: event.fallbackReason ?? null,
      latencyMs: event.latencyMs ?? null,
      latencyBucket,
      creditCost: event.creditCost ?? 0,
      metadata: event.metadata ?? null,
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "ai_telemetry_persist_error",
        source_event: "public_agent_response",
        error_type: classifyAiError(error),
        timestamp: new Date().toISOString(),
      })
    );
  }
}

export function classifyAiError(error: unknown): string {
  if (error instanceof Error) {
    return error.name || "Error";
  }

  return "UnknownError";
}
