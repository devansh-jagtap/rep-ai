import type { AgentLeadPayload } from "./types";

export function parseLeadPayload(raw: string): { reply: string; lead: AgentLeadPayload } | null {
  const jsonMatch = raw.match(/\{[\s\n]*"lead_detected"[\s\S]*?\}[\s\n]*$/);
  if (!jsonMatch) return null;

  try {
    const jsonStr = jsonMatch[0];
    const parsed = JSON.parse(jsonStr) as Partial<AgentLeadPayload>;

    if (typeof parsed.lead_detected !== "boolean" || typeof parsed.confidence !== "number") {
      return null;
    }

    const replyEnd = raw.lastIndexOf(jsonStr);
    const reply = raw.slice(0, replyEnd).trim();

    const leadData = parsed.lead_data;
    return {
      reply,
      lead: {
        lead_detected: parsed.lead_detected,
        confidence: Math.max(0, Math.min(100, parsed.confidence)),
        lead_data: leadData
          ? {
              name: String(leadData.name ?? ""),
              email: String(leadData.email ?? ""),
              budget: String(leadData.budget ?? ""),
              project_details: String(leadData.project_details ?? ""),
            }
          : { name: "", email: "", budget: "", project_details: "" },
      },
    };
  } catch {
    return null;
  }
}
