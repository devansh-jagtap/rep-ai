import type { PortfolioTone } from "@/lib/db/portfolio";
import {
  getDefaultVisibleSections,
  mergeVisibleSections,
  PORTFOLIO_SECTION_REGISTRY,
} from "@/lib/portfolio/section-registry";
import { validateHandle } from "@/lib/validation/handle";
import type {
  OnboardingData,
  OnboardingProjectInput,
  OnboardingSetupPath,
  OnboardingStep,
} from "@/lib/onboarding/types";

const ALLOWED_TONES: PortfolioTone[] = ["Professional", "Friendly", "Bold", "Minimal"];

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function parseSelectedSections(input: string): OnboardingSelectedSections {
  const normalized = input.toLowerCase();
  const parseToggle = (key: keyof Omit<OnboardingSelectedSections, "hero">) => {
    if (normalized.includes(`${key}:on`) || normalized.includes(`${key}=on`) || normalized.includes(`${key}=true`)) return true;
    if (normalized.includes(`${key}:off`) || normalized.includes(`${key}=off`) || normalized.includes(`${key}=false`)) return false;
    if (normalized.includes(`no ${key}`) || normalized.includes(`without ${key}`) || normalized.includes(`skip ${key}`)) return false;
    if (normalized.includes(key)) return true;
    return DEFAULT_ONBOARDING_SECTIONS[key];
  };

  return {
    hero: true,
    about: parseToggle("about"),
    services: parseToggle("services"),
    projects: parseToggle("projects"),
    cta: parseToggle("cta"),
    socials: parseToggle("socials"),
  };
}

export function parseServices(input: string) {
  return input
    .split(/[\n,]/)
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean);
}

export function parseFaqs(input: string) {
  return input
    .split(/\n+/)
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean);
}

export function parseProjects(input: string): OnboardingProjectInput[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [titlePart, ...descriptionParts] = line.split(":");
      return {
        title: normalizeWhitespace(titlePart ?? ""),
        description: normalizeWhitespace(descriptionParts.join(":")),
      };
    })
    .filter((project) => project.title && project.description);
}

export function validateStepInput(step: OnboardingStep, answer: string): ValidationResult<unknown> {
  const cleaned = normalizeWhitespace(answer);

  if (step === "setupPath") {
    const normalized = cleaned.toLowerCase();
    if (
      normalized.includes("already") ||
      normalized.includes("website") ||
      normalized.includes("agent only")
    ) {
      return { ok: true, value: "existing-site" as OnboardingSetupPath };
    }
    if (
      normalized.includes("build") ||
      normalized.includes("scratch") ||
      normalized.includes("portfolio + agent")
    ) {
      return { ok: true, value: "build-new" as OnboardingSetupPath };
    }
    return {
      ok: false,
      message: "Please choose either 'I already have a website' or 'Build me a portfolio + agent'.",
    };
  }

  if (step === "name") {
    if (cleaned.length < 2 || cleaned.length > 80) {
      return { ok: false, message: "Please provide a full name between 2 and 80 characters." };
    }
    return { ok: true, value: cleaned };
  }

  if (step === "selectedSections") {
    return { ok: true, value: parseSelectedSections(answer) };
  }

  if (step === "title") {
    if (cleaned.length < 2 || cleaned.length > 100) {
      return {
        ok: false,
        message: "Please provide a professional title between 2 and 100 characters.",
      };
    }
    return { ok: true, value: cleaned };
  }

  if (step === "bio") {
    if (cleaned.length < 20 || cleaned.length > 400) {
      return { ok: false, message: "Bio must be between 20 and 400 characters." };
    }
    return { ok: true, value: cleaned };
  }

  if (step === "sections") {
    const sections = parseSections(answer);
    if (sections.length < 1) {
      const available = PORTFOLIO_SECTION_REGISTRY.map((section) => section.key).join(", ");
      return {
        ok: false,
        message: `Please pick at least one section from: ${available}.`,
      };
    }
    return { ok: true, value: sections };
  }

  if (step === "services") {
    const services = parseServices(answer);
    if (services.length < 1) {
      return { ok: false, message: "Please provide at least one service." };
    }
    return { ok: true, value: services.slice(0, 10) };
  }

  if (step === "projects") {
    const projects = parseProjects(answer);
    if (projects.length < 1) {
      return {
        ok: false,
        message: "Please add at least one project in the format `Title: Description`.",
      };
    }

    if (projects.length > 3) {
      return { ok: false, message: "Please share up to 3 projects." };
    }

    return { ok: true, value: projects };
  }

  if (step === "siteUrl") {
    const isValid = /^https?:\/\/.+/i.test(cleaned);
    if (!isValid) return { ok: false, message: "Please provide a valid URL starting with http:// or https://." };
    return { ok: true, value: cleaned };
  }

  if (step === "targetAudience" || step === "contactPreferences") {
    if (cleaned.length < 5) return { ok: false, message: "Please share a little more detail." };
    return { ok: true, value: cleaned };
  }

  if (step === "faqs") {
    const faqs = parseFaqs(answer);
    if (faqs.length < 1) return { ok: false, message: "Please provide at least one FAQ." };
    return { ok: true, value: faqs.slice(0, 10) };
  }

  if (step === "tone") {
    if (!ALLOWED_TONES.includes(cleaned as PortfolioTone)) {
      return { ok: false, message: "Please choose one of: Professional, Friendly, Bold, Minimal." };
    }
    return { ok: true, value: cleaned as PortfolioTone };
  }

  const handleResult = validateHandle(answer);
  if (!handleResult.ok) {
    return { ok: false, message: handleResult.message };
  }

  return { ok: true, value: handleResult.value };
}

export function validateFinalOnboardingState(state: Partial<OnboardingData> | undefined | null): ValidationResult<OnboardingData> {
  if (state == null || typeof state !== "object") {
    return { ok: false, message: "Invalid onboarding state." };
  }

  const stateWithDefaults = withDefaultSelectedSections(state);
  if (!stateWithDefaults) {
    return { ok: false, message: "Invalid onboarding state." };
  }

  const commonRequired: Array<keyof OnboardingData> = [
    "setupPath",
    "name",
    "selectedSections",
    "title",
    "bio",
    "sections",
    "services",
    "tone",
    "handle",
  ];

  for (const key of commonRequired) {
    if (stateWithDefaults[key] === undefined || stateWithDefaults[key] === null) {
      return { ok: false, message: `Missing onboarding field: ${key}` };
    }
  }

  if (stateWithDefaults.selectedSections.services) {
    if (!Array.isArray(stateWithDefaults.services) || stateWithDefaults.services.length < 1) {
      return { ok: false, message: "Missing onboarding field: services" };
    }
  }

  if (stateWithDefaults.setupPath === "build-new" && stateWithDefaults.selectedSections.projects) {
    if (!Array.isArray(stateWithDefaults.projects) || stateWithDefaults.projects.length < 1) {
      return { ok: false, message: "Missing onboarding field: projects" };
    }
  }

  if (stateWithDefaults.setupPath === "existing-site") {
    if (!stateWithDefaults.siteUrl) {
      return { ok: false, message: "Missing onboarding field: siteUrl" };
    }
  }

  return {
    ok: true,
    value: {
      ...(state as OnboardingData),
      sections: mergeVisibleSections(state.sections, getDefaultVisibleSections()),
    },
  };
}
