import type { OnboardingSection, OnboardingStep, OnboardingStepQuestionConfig } from "@/lib/onboarding/types";

type SectionQuestionMap = Record<OnboardingSection, Partial<Record<OnboardingStep, OnboardingStepQuestionConfig>>>;

export const ONBOARDING_SECTION_QUESTION_CONFIGS: SectionQuestionMap = {
  setup: {
    setupPath: {
      step: "setupPath",
      section: "setup",
      blocks: [
        {
          id: "setup-path-selector",
          analyticsId: "setup-path-selector",
          type: "selector",
          prompt: "Choose a setup path.",
          options: [
            { id: "existing-site", label: "I already have a website", value: "I already have a website" },
            { id: "build-new", label: "Build me a portfolio + agent", value: "Build me a portfolio + agent" },
          ],
        },
      ],
    },
  },
  profile: {
    name: {
      step: "name",
      section: "profile",
      blocks: [{ id: "name-input", analyticsId: "name-input", type: "text_input", prompt: "Great to meet you. What full name should appear on your portfolio?", placeholder: "Jane Doe" }],
    },
    title: {
      step: "title",
      section: "profile",
      blocks: [{ id: "title-input", analyticsId: "title-input", type: "text_input", prompt: "Nice. What professional title best describes your work?", placeholder: "Product Designer" }],
    },
    bio: {
      step: "bio",
      section: "profile",
      blocks: [{ id: "bio-input", analyticsId: "bio-input", type: "multi_input", prompt: "Share your elevator pitch or short bio.", placeholder: "I help...", helperText: "Aim for 20+ characters." }],
    },
  },
  work: {
    services: {
      step: "services",
      section: "work",
      blocks: [{ id: "services-input", analyticsId: "services-input", type: "multi_input", prompt: "What services/work do you offer?", helperText: "Use comma-separated items or one per line." }],
    },
    projects: {
      step: "projects",
      section: "work",
      blocks: [{ id: "projects-input", analyticsId: "projects-input", type: "multi_input", prompt: "Tell me about 1-3 projects.", helperText: "Format each line as Title: Description." }],
    },
  },
  existingSite: {
    siteUrl: {
      step: "siteUrl",
      section: "existingSite",
      blocks: [{ id: "site-url-input", analyticsId: "site-url-input", type: "text_input", prompt: "What is your website URL?", placeholder: "https://example.com" }],
    },
    targetAudience: {
      step: "targetAudience",
      section: "existingSite",
      blocks: [{ id: "target-audience-input", analyticsId: "target-audience-input", type: "multi_input", prompt: "Who is your target audience?" }],
    },
    contactPreferences: {
      step: "contactPreferences",
      section: "existingSite",
      blocks: [{ id: "contact-preferences-input", analyticsId: "contact-preferences-input", type: "multi_input", prompt: "How should your agent handle contact preferences?" }],
    },
    faqs: {
      step: "faqs",
      section: "existingSite",
      blocks: [{ id: "faqs-input", analyticsId: "faqs-input", type: "multi_input", prompt: "Share FAQs you want your agent to answer.", helperText: "One FAQ per line." }],
    },
  },
  preferences: {
    tone: {
      step: "tone",
      section: "preferences",
      blocks: [{ id: "tone-selector", analyticsId: "tone-selector", type: "selector", prompt: "Choose your preferred tone.", options: [
        { id: "professional", label: "Professional", value: "Professional" },
        { id: "friendly", label: "Friendly", value: "Friendly" },
        { id: "bold", label: "Bold", value: "Bold" },
        { id: "minimal", label: "Minimal", value: "Minimal" },
      ] }],
    },
    handle: {
      step: "handle",
      section: "preferences",
      blocks: [{ id: "handle-input", analyticsId: "handle-input", type: "text_input", prompt: "Last step: choose your public handle.", placeholder: "jane-doe" }],
    },
  },
};

export function getQuestionConfigForStep(step: OnboardingStep): OnboardingStepQuestionConfig | null {
  for (const sectionConfigs of Object.values(ONBOARDING_SECTION_QUESTION_CONFIGS)) {
    const config = sectionConfigs[step];
    if (config) return config;
  }
  return null;
}
