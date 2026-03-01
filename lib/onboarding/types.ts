import type { PortfolioTone } from "@/lib/db/portfolio";
import type { PortfolioSectionKey } from "@/lib/portfolio/section-registry";

export type OnboardingSetupPath = "existing-site" | "build-new";

export const ONBOARDING_STEPS = [
  "setupPath",
  "siteUrl",
  "name",
  "selectedSections",
  "title",
  "bio",
  "sections",
  "services",
  "projects",
  "targetAudience",
  "contactPreferences",
  "faqs",
  "tone",
  "handle",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export type OnboardingBlockType = "text" | "selector" | "text_input" | "multi_input" | "confirm" | "tag_selector" | "card_editor" | "accordion_editor" | "input_with_validation";

interface OnboardingBlockBase {
  id: string;
  type: OnboardingBlockType;
  analyticsId?: string;
  prompt: string;
}

export interface OnboardingTextBlock extends OnboardingBlockBase {
  type: "text";
}

export interface OnboardingSelectorOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface OnboardingSelectorBlock extends OnboardingBlockBase {
  type: "selector";
  options: OnboardingSelectorOption[];
  layout?: "inline" | "cards" | "chips";
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

export interface OnboardingTagSelectorBlock extends OnboardingBlockBase {
  type: "tag_selector";
  presets?: string[];
  allowCustom?: boolean;
  max?: number;
}

export interface OnboardingCardEditorBlock extends OnboardingBlockBase {
  type: "card_editor";
  fields: Array<{
    id: string;
    label: string;
    type: "text" | "textarea" | "url";
    placeholder?: string;
    required?: boolean;
  }>;
  maxItems?: number;
  minItems?: number;
}

export interface OnboardingAccordionEditorBlock extends OnboardingBlockBase {
  type: "accordion_editor";
  itemLabel?: string;
}

export interface OnboardingInputWithValidationBlock extends OnboardingBlockBase {
  type: "input_with_validation";
  validationType?: "handle" | "url" | "email";
  placeholder?: string;
}

export type OnboardingBlock =
  | OnboardingTextBlock
  | OnboardingSelectorBlock
  | OnboardingTextInputBlock
  | OnboardingMultiInputBlock
  | OnboardingConfirmBlock
  | OnboardingTagSelectorBlock
  | OnboardingCardEditorBlock
  | OnboardingAccordionEditorBlock
  | OnboardingInputWithValidationBlock;

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
  selectedSections: OnboardingSelectedSections;
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

export interface OnboardingSelectedSections {
  hero: true;
  about: boolean;
  services: boolean;
  projects: boolean;
  cta: boolean;
  socials: boolean;
}

export const DEFAULT_ONBOARDING_SECTIONS: OnboardingSelectedSections = {
  hero: true,
  about: true,
  services: true,
  projects: true,
  cta: true,
  socials: true,
};

export function withDefaultSelectedSections(
  state: Partial<OnboardingData> | null | undefined
): Partial<OnboardingData> | null {
  if (!state || typeof state !== "object") {
    return null;
  }

  const current = state.selectedSections;
  const merged = {
    ...DEFAULT_ONBOARDING_SECTIONS,
    ...(current && typeof current === "object" ? current : {}),
    hero: true as const,
  };

  return {
    ...state,
    selectedSections: merged,
  };
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

export const ONBOARDING_QUESTIONS: Record<OnboardingStep, string> = {
  setupPath: "Choose a setup path: I already have a website, or Build me a portfolio + agent.",
  name: "Great to meet you. What full name should appear on your portfolio?",
  title: "Nice. What professional title best describes your work?",
  selectedSections:
    "Choose which sections to include: About, Services, Projects, CTA, and Socials. Hero is always on.",
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
