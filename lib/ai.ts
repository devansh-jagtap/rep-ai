type LeadData = {
  name: string;
  email: string;
  budget: string;
  project_details: string;
};

function pickValue(block: string, label: string) {
  const match = block.match(new RegExp(`${label}:\\s*([^\\n]+)`));
  return match?.[1]?.trim() ?? "";
}

function extractProfile(prompt: string) {
  const profileStart = prompt.indexOf("PROFILE INFORMATION");
  if (profileStart === -1) {
    return null;
  }

  const window = prompt.slice(profileStart, Math.min(prompt.length, profileStart + 3000));
  return {
    name: pickValue(window, "Name") || "",
    bio: pickValue(window, "Bio") || "",
    services: pickValue(window, "Services Offered") || "",
    pricing: pickValue(window, "Pricing Information") || "",
    tone: pickValue(window, "Tone & Communication Style") || "",
  };
}

function extractVisitorMessage(prompt: string) {
  const lines = prompt
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (!line.startsWith("{") && !line.includes("PROFILE INFORMATION") && !line.includes("STRICT ACCURACY RULES")) {
      return line;
    }
  }

  return "";
}

function detectLeadData(text: string): LeadData {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";

  const budgetMatch = text.match(/(?:\$|usd\s*)\d[\d,]*/i) ?? text.match(/budget[^\n,.!?]*/i);
  const budget = budgetMatch?.[0]?.trim() ?? "";

  const nameMatch = text.match(/(?:i am|i'm|my name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  const name = nameMatch?.[1]?.trim() ?? "";

  return {
    name,
    email,
    budget,
    project_details: text.trim(),
  };
}

export async function generateChatReply(prompt: string) {
  if (!prompt.trim()) {
    return "Please send a prompt.";
  }

  const profile = extractProfile(prompt);
  const visitorMessage = extractVisitorMessage(prompt) || prompt.trim();
  const lead = detectLeadData(visitorMessage);

  const intentScore = [
    /hire|book|project|timeline|proposal|quote|budget|start/i.test(visitorMessage) ? 40 : 0,
    lead.email ? 30 : 0,
    lead.budget ? 15 : 0,
    lead.name ? 10 : 0,
  ].reduce((sum, n) => sum + n, 0);

  const leadDetected = intentScore >= 60;
  const confidence = Math.min(100, intentScore + (visitorMessage.length > 35 ? 5 : 0));

  const intro = profile?.name
    ? `Thanks for reaching out to ${profile.name}.`
    : "Thanks for reaching out.";

  const capability = profile?.services && !profile.services.includes("{{")
    ? `Based on the provided services, here is what I can share: ${profile.services}`
    : "I can help with information that is included in the provided profile.";

  const pricing = profile?.pricing && !profile.pricing.includes("{{")
    ? `Pricing info available: ${profile.pricing}`
    : "I’m not sure about pricing based on the available profile data.";

  const questions = leadDetected
    ? "To move forward, please confirm your preferred timeline and any must-have deliverables."
    : "Could you share your goal, scope, and timeline so I can guide you accurately?";

  const reply = `${intro}\n\n${capability}\n${pricing}\n\n${questions}`;

  const payload = leadDetected
    ? {
        lead_detected: true,
        confidence,
        lead_data: {
          name: lead.name,
          email: lead.email,
          budget: lead.budget,
          project_details: lead.project_details,
        },
      }
    : {
        lead_detected: false,
        confidence,
        lead_data: null,
      };

  return `${reply}\n\n${JSON.stringify(payload, null, 2)}`;
}
