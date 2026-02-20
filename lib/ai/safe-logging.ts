export interface PublicAgentLogEvent {
  handle: string;
  model: string;
  tokensUsed: number;
  leadDetected: boolean;
  confidence: number;
  errorType?: string;
}

export function logPublicAgentEvent(event: PublicAgentLogEvent): void {
  const payload = {
    event: "public_agent_response",
    handle: event.handle,
    model: event.model,
    tokens_used: event.tokensUsed,
    lead_detected: event.leadDetected,
    confidence: event.confidence,
    error_type: event.errorType ?? null,
    timestamp: new Date().toISOString(),
  };

  console.info(JSON.stringify(payload));
}

export function classifyAiError(error: unknown): string {
  if (error instanceof Error) {
    return error.name || "Error";
  }

  return "UnknownError";
}
