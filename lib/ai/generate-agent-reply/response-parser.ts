import type { AgentLeadPayload } from "./types";

function extractJsonWithLeadDetected(text: string): { json: string; startIdx: number } | null {
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/g);
  if (codeBlock) {
    for (const block of codeBlock) {
      const inner = block.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
      if (inner.includes('"lead_detected"') || inner.includes("'lead_detected'") || inner.includes("lead_detected")) {
        const idx = text.indexOf(block);
        return { json: inner.replace(/'/g, '"'), startIdx: idx };
      }
    }
  }

  const leadIdx = text.lastIndexOf("lead_detected");
  if (leadIdx === -1) return null;

  const openIdx = text.lastIndexOf("{", leadIdx);
  if (openIdx === -1) return null;

  let depth = 0;
  let endIdx = -1;
  let inStr = false;
  let strChar = "";

  for (let i = openIdx; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (c === "\\") {
        i++;
        continue;
      }
      if (c === strChar) {
        inStr = false;
      }
      continue;
    }
    if (c === '"' || c === "'") {
      inStr = true;
      strChar = c;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
  if (endIdx === -1) return null;

  let raw = text.slice(openIdx, endIdx + 1);
  raw = raw.replace(/'/g, '"');
  raw = raw.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
  raw = raw.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');

  return { json: raw, startIdx: openIdx };
}

export function parseLeadPayload(raw: string): { reply: string; lead: AgentLeadPayload } | null {
  const extracted = extractJsonWithLeadDetected(raw);
  if (!extracted) return null;

  try {
    const parsed = JSON.parse(extracted.json) as Record<string, unknown>;

    const rawDetected = parsed.lead_detected;
    const leadDetected =
      typeof rawDetected === "boolean"
        ? rawDetected
        : rawDetected === "true"
          ? true
          : rawDetected === "false"
            ? false
            : null;

    const rawConfidence = parsed.confidence;
    const confidence =
      typeof rawConfidence === "number"
        ? rawConfidence
        : typeof rawConfidence === "string"
          ? Number(rawConfidence)
          : null;

    if (leadDetected === null || confidence === null || Number.isNaN(confidence)) {
      return null;
    }

    const reply = raw.slice(0, extracted.startIdx).trim();

    const leadData = parsed.lead_data as Record<string, unknown> | null | undefined;
    return {
      reply,
      lead: {
        lead_detected: leadDetected,
        confidence: Math.max(0, Math.min(100, confidence)),
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
