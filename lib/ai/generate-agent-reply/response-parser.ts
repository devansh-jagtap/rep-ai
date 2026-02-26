import type { AgentLeadPayload } from "./types";

function extractJsonWithLeadDetected(text: string): { json: string; startIdx: number } | null {
  // Strip markdown code blocks - model may wrap JSON in ```json ... ``` or ``` ... ```
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/g);
  if (codeBlock) {
    for (const block of codeBlock) {
      const inner = block.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
      if (inner.includes('"lead_detected"')) {
        const idx = text.indexOf(block);
        return { json: inner, startIdx: idx };
      }
    }
  }

  // Find JSON object containing "lead_detected" (often at end of response)
  const leadIdx = text.lastIndexOf('"lead_detected"');
  if (leadIdx === -1) return null;

  const openIdx = text.lastIndexOf("{", leadIdx);
  if (openIdx === -1) return null;

  // Match braces (ignore braces inside strings for typical model output)
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
  return { json: text.slice(openIdx, endIdx + 1), startIdx: openIdx };
}

export function parseLeadPayload(raw: string): { reply: string; lead: AgentLeadPayload } | null {
  const extracted = extractJsonWithLeadDetected(raw);
  if (!extracted) return null;

  try {
    const parsed = JSON.parse(extracted.json) as Partial<AgentLeadPayload>;

    if (typeof parsed.lead_detected !== "boolean" || typeof parsed.confidence !== "number") {
      return null;
    }

    const reply = raw.slice(0, extracted.startIdx).trim();

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
