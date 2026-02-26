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
          prompt: "How would you like to get started?",
          layout: "cards",
          options: [
            { 
              id: "existing-site", 
              label: "Agent Rep Only", 
              value: "I already have a website",
              description: "Quick 2-min setup • Connect your existing website with an AI agent",
              icon: "bot",
              color: "blue"
            },
            { 
              id: "build-new", 
              label: "Agent Rep + Portfolio", 
              value: "Build me a portfolio + agent",
              description: "Full portfolio site • AI-powered agent included • Perfect for new portfolios",
              icon: "globe",
              color: "green"
            },
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
      blocks: [{ 
        id: "services-selector", 
        analyticsId: "services-selector", 
        type: "tag_selector", 
        prompt: "What services or work do you offer?",
        presets: [
          "Web Development", "Mobile App Development", "UI/UX Design", "Graphic Design",
          "Content Writing", "Marketing", "SEO", "Social Media Management",
          "Consulting", "Data Analytics", "Video Production", "Photography",
          "Copywriting", "Brand Strategy", "Product Management", "UX Research"
        ],
        allowCustom: true,
        max: 10
      }],
    },
    projects: {
      step: "projects",
      section: "work",
      blocks: [{ 
        id: "projects-editor", 
        analyticsId: "projects-editor", 
        type: "card_editor", 
        prompt: "Tell me about 1-3 projects you'd like to showcase.",
        fields: [
          { id: "title", label: "Project Title", type: "text", placeholder: "E-commerce Platform Redesign", required: true },
          { id: "description", label: "Description", type: "textarea", placeholder: "Brief description of what you built...", required: true }
        ],
        maxItems: 3,
        minItems: 1
      }],
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
      blocks: [{ 
        id: "target-audience-selector", 
        analyticsId: "target-audience-selector", 
        type: "tag_selector", 
        prompt: "Who is your target audience?",
        presets: [
          "Startups", "Small Businesses", "Enterprises", "Individual Clients", 
          "Agencies", "Nonprofits", "E-commerce Businesses", "Tech Companies",
          "Healthcare", "Finance", "Education", "Real Estate"
        ],
        allowCustom: true,
        max: 5
      }],
    },
    contactPreferences: {
      step: "contactPreferences",
      section: "existingSite",
      blocks: [{ 
        id: "contact-preferences-selector", 
        analyticsId: "contact-preferences-selector", 
        type: "tag_selector", 
        prompt: "How should contacts reach you?",
        presets: ["Email", "Calendly", "Contact Form", "WhatsApp", "Phone", "Telegram"],
        allowCustom: true,
        max: 3
      }],
    },
    faqs: {
      step: "faqs",
      section: "existingSite",
      blocks: [{ 
        id: "faqs-editor", 
        analyticsId: "faqs-editor", 
        type: "accordion_editor", 
        prompt: "Add FAQs you'd like your agent to answer.",
        itemLabel: "FAQ"
      }],
    },
  },
  preferences: {
    tone: {
      step: "tone",
      section: "preferences",
      blocks: [{ 
        id: "tone-selector", 
        analyticsId: "tone-selector", 
        type: "selector", 
        prompt: "Choose your preferred tone.", 
        layout: "cards",
        options: [
          { id: "professional", label: "Professional", value: "Professional", description: "\"I help enterprise teams build scalable solutions with proven methodologies.\"", icon: "briefcase" },
          { id: "friendly", label: "Friendly", value: "Friendly", description: "\"Hey there! I'd love to help you with your next project.\"", icon: "smile" },
          { id: "bold", label: "Bold", value: "Bold", description: "\"I don't just design products—I transform businesses.\"", icon: "zap" },
          { id: "minimal", label: "Minimal", value: "Minimal", description: "\"I design clean, focused solutions.\"", icon: "minus" },
        ] 
      }],
    },
    handle: {
      step: "handle",
      section: "preferences",
      blocks: [{ 
        id: "handle-input", 
        analyticsId: "handle-input", 
        type: "input_with_validation", 
        validationType: "handle",
        prompt: "Last step: choose your public handle.", 
        placeholder: "jane-doe" 
      }],
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
