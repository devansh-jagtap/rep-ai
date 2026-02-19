import type { PortfolioTone } from "@/lib/db/portfolio";

export const ONBOARDING_STEPS = ["name", "title", "bio", "services", "projects", "tone", "handle"] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface OnboardingProjectInput {
  title: string;
  description: string;
}

export interface OnboardingData {
  name: string;
  title: string;
  bio: string;
  services: string[];
  projects: OnboardingProjectInput[];
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
  name: "Great to meet you. What full name should appear on your portfolio?",
  title: "Nice. What professional title best describes your work?",
  bio: "Now share a short bio (at least 20 characters).",
  services:
    "What services do you offer? Share them in plain language, one per line or comma-separated.",
  projects: "Tell me about 2–3 projects. Format each as `Title: Description` on a new line.",
  tone: "Choose your preferred tone: Professional, Friendly, Bold, or Minimal.",
  handle:
    "Last step: choose your public handle (3–30 chars, lowercase letters/numbers/hyphens).",
};
