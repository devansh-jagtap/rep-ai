import type { MessagePartLike } from "@/app/onboarding/_lib/onboarding-chat-utils";

export type OnboardingStepType = 
  | "setupPath"
  | "name" 
  | "selectedSections"
  | "title"
  | "bio"
  | "services"
  | "projects"
  | "siteUrl"
  | "targetAudience"
  | "contactPreferences"
  | "faqs"
  | "tone"
  | "handle";

export function detectOnboardingStep(messages: { parts?: MessagePartLike[]; role: string; content?: string }[]): OnboardingStepType | null {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "assistant") return null;
  
  const messageParts = (lastMessage.parts || []) as MessagePartLike[];
  const textParts = messageParts
    .filter((part): part is { type: "text"; text: string } => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text.toLowerCase());
  
  const text = textParts.join(" ");

  if (text.includes("setup") || text.includes("get started") || text.includes("which would you like")) {
    if (text.includes("portfolio") || text.includes("agent")) {
      return "setupPath";
    }
  }

  if (text.includes("full name") || text.includes("name should appear")) {
    return "name";
  }

  if (text.includes("sections") && (text.includes("about") || text.includes("services") || text.includes("hero"))) {
    return "selectedSections";
  }

  if (text.includes("professional title") || text.includes("title best describes")) {
    return "title";
  }

  if (text.includes("elevator pitch") || text.includes("short bio") || text.includes("bio")) {
    return "bio";
  }

  if (text.includes("services") || text.includes("work do you offer")) {
    return "services";
  }

  if (text.includes("projects") || text.includes("tell me about")) {
    return "projects";
  }

  if (text.includes("website url") || text.includes("site url")) {
    return "siteUrl";
  }

  if (text.includes("target audience") || text.includes("who is your")) {
    return "targetAudience";
  }

  if (text.includes("contact") || text.includes("reach you") || text.includes("handle contact")) {
    return "contactPreferences";
  }

  if (text.includes("faq") || text.includes("frequently asked")) {
    return "faqs";
  }

  if (text.includes("tone") || text.includes("preferred tone")) {
    return "tone";
  }

  if (text.includes("handle") || text.includes("public") || text.includes("url")) {
    return "handle";
  }

  return null;
}

export function getStepDetectionPatterns(): Record<OnboardingStepType, string[]> {
  return {
    setupPath: ["setup", "get started", "which would you like", "portfolio", "agent"],
    name: ["full name", "name should appear"],
    selectedSections: ["sections", "about", "services", "hero", "projects", "cta", "socials"],
    title: ["professional title", "title best describes", "what title"],
    bio: ["elevator pitch", "short bio", "share your"],
    services: ["services", "work do you offer", "what services"],
    projects: ["projects", "tell me about", "project"],
    siteUrl: ["website url", "site url", "what is your website"],
    targetAudience: ["target audience", "who is your", "who should"],
    contactPreferences: ["contact", "reach you", "handle contact", "how should"],
    faqs: ["faq", "frequently asked", "questions you want"],
    tone: ["tone", "preferred tone", "choose your tone"],
    handle: ["handle", "public handle", "url handle", "choose your"],
  };
}
