import type { PortfolioTone } from "@/lib/db/portfolio";

export type OnboardingSetupPath = "existing-site" | "build-new";

export const ONBOARDING_STEPS = [
  "setupPath",
  "name",
  "title",
  "bio",
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

export type OnboardingBlockType = "text" | "selector" | "text_input" | "multi_input" | "confirm";

interface OnboardingBlockBase {
  id: string;
  type: OnboardingBlockType;
  analyticsId?: string;
  prompt: string;
}

export interface OnboardingTextBlock extends OnboardingBlockBase {
  type: "text";
}

export interface OnboardingSelectorBlock extends OnboardingBlockBase {
  type: "selector";
  options: Array<{
    id: string;
    label: string;
    value: string;
  }>;
}

export interface OnboardingTextInputBlock extends OnboardingBlockBase {
  type: "text_input";
  placeholder?: string;
}

export interface OnboardingMultiInputBlock extends OnboardingBlockBase {
  type: "multi_input";
  placeholder?: string;
  helperText?: string;
}

export interface OnboardingConfirmBlock extends OnboardingBlockBase {
  type: "confirm";
  confirmLabel?: string;
  rejectLabel?: string;
}

export type OnboardingBlock =
  | OnboardingTextBlock
  | OnboardingSelectorBlock
  | OnboardingTextInputBlock
  | OnboardingMultiInputBlock
  | OnboardingConfirmBlock;

export type OnboardingSection = "setup" | "profile" | "work" | "existingSite" | "preferences";

export interface OnboardingStepQuestionConfig {
  step: OnboardingStep;
  section: OnboardingSection;
  blocks: OnboardingBlock[];
}

export interface OnboardingProjectInput {
  title: string;
  description: string;
}

export interface OnboardingData {
  setupPath: OnboardingSetupPath;
  name: string;
  title: string;
  bio: string;
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
  assistantBlocks?: OnboardingBlock[];
  state: Partial<OnboardingData>;
  completed: boolean;
}
