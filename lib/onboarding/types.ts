import type { PortfolioTone } from "@/lib/db/portfolio";
import type { PortfolioSectionKey } from "@/lib/portfolio/section-registry";

export type OnboardingSetupPath = "existing-site" | "build-new";

export const ONBOARDING_STEPS = [
  "setupPath",
  "name",
  "title",
  "bio",
  "sections",
  "services",
  "projects",
  "siteUrl",
  "targetAudience",
  "contactPreferences",
  "faqs",
  "tone",
  "handle",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface OnboardingProjectInput {
  title: string;
  description: string;
}

export interface OnboardingData {
  setupPath: OnboardingSetupPath;
  name: string;
  title: string;
  bio: string;
  sections: PortfolioSectionKey[];
  services: string[];
  projects?: OnboardingProjectInput[];
  siteUrl?: string;
  targetAudience?: string;
  contactPreferences?: string;
  faqs?: string[];
  tone: PortfolioTone;
  handle: string;
}

export interface OnboardingChatRequest {
  step: OnboardingStep;
  answer: string;
  state: Partial<OnboardingData>;
}

export interface OnboardingChatResponse {
  ok: boolean;
  error?: string;
  step: OnboardingStep;
  nextStep: OnboardingStep | null;
  assistantMessage: string;
  state: Partial<OnboardingData>;
  completed: boolean;
}

export const ONBOARDING_QUESTIONS: Record<OnboardingStep, string> = {
  setupPath: "Choose a setup path: I already have a website, or Build me a portfolio + agent.",
  name: "Great to meet you. What full name should appear on your portfolio?",
  title: "Nice. What professional title best describes your work?",
  bio: "Share your elevator pitch or short bio (at least 20 characters).",
  sections:
    "Pick the sections you want visible: hero, about, services, projects, cta. You can list multiple separated by commas.",
  services:
    "What services/work do you offer? Share them in plain language, one per line or comma-separated.",
  projects: "Tell me about 1-3 projects. Format each as `Title: Description` on a new line.",
  siteUrl: "What is your website URL?",
  targetAudience: "Who is your target audience?",
  contactPreferences: "How should your agent handle contact preferences?",
  faqs: "Share a few FAQs you want your agent to answer (one per line).",
  tone: "Choose your preferred tone: Professional, Friendly, Bold, or Minimal.",
  handle:
    "Last step: choose your public handle (3–30 chars, lowercase letters/numbers/hyphens).",
};
