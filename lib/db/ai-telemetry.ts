import { and, count, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { aiTelemetryEvents } from "@/lib/schema";

export interface StoreAiTelemetryEventInput {
  handle: string | null;
  agentId: string | null;
  portfolioId: string | null;
  sessionId: string | null;
  eventType: string;
  model: string | null;
  mode: string | null;
  tokensUsed: number;
  leadDetected: boolean;
  success: boolean;
  fallbackReason: string | null;
  latencyMs: number | null;
  latencyBucket: string | null;
  creditCost: number;
  metadata?: Record<string, unknown> | null;
}

export async function storeAiTelemetryEvent(input: StoreAiTelemetryEventInput): Promise<void> {
  await db.insert(aiTelemetryEvents).values({
    id: crypto.randomUUID(),
    handle: input.handle,
    agentId: input.agentId,
    portfolioId: input.portfolioId,
    sessionId: input.sessionId,
    eventType: input.eventType,
    model: input.model,
    mode: input.mode,
    tokensUsed: input.tokensUsed,
    leadDetected: input.leadDetected,
    success: input.success,
    fallbackReason: input.fallbackReason,
    latencyMs: input.latencyMs,
    latencyBucket: input.latencyBucket,
    creditCost: input.creditCost,
    metadata: input.metadata ?? null,
  });
}

interface SpikeThresholdInput {
  lookbackMinutes: number;
  minEvents: number;
  failureRateThreshold: number;
}

export async function hasFailureSpike(input: SpikeThresholdInput): Promise<boolean> {
  const since = new Date(Date.now() - input.lookbackMinutes * 60_000);

  const [summary] = await db
    .select({
      total: count(),
      failures: count(sql`case when ${aiTelemetryEvents.success} = false then 1 end`),
    })
    .from(aiTelemetryEvents)
    .where(gte(aiTelemetryEvents.createdAt, since));

  const total = Number(summary?.total ?? 0);
  const failures = Number(summary?.failures ?? 0);

  if (total < input.minEvents) {
    return false;
  }

  return failures / total >= input.failureRateThreshold;
}

export async function hasModelMisconfigurationSpike(lookbackMinutes: number, minEvents: number): Promise<boolean> {
  const since = new Date(Date.now() - lookbackMinutes * 60_000);

  const [summary] = await db
    .select({
      total: count(),
      misconfigured: count(
        sql`case when ${aiTelemetryEvents.fallbackReason} in ('AgentModelMisconfigured', 'AgentTemperatureMisconfigured', 'UnsupportedModel') then 1 end`
      ),
    })
    .from(aiTelemetryEvents)
    .where(and(eq(aiTelemetryEvents.eventType, "public_agent_response"), gte(aiTelemetryEvents.createdAt, since)));

  const total = Number(summary?.total ?? 0);
  const misconfigured = Number(summary?.misconfigured ?? 0);

  if (total < minEvents) {
    return false;
  }

  return misconfigured / total >= 0.1;
}
