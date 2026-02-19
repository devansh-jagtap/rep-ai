import type { PortfolioTone } from "@/lib/db/portfolio";
import { validateHandle } from "@/lib/validation/handle";
import type {
  OnboardingData,
  OnboardingProjectInput,
  OnboardingStep,
} from "@/lib/onboarding/types";

const ALLOWED_TONES: PortfolioTone[] = ["Professional", "Friendly", "Bold", "Minimal"];

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function parseServices(input: string) {
  return input
    .split(/[\n,]/)
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

  if (step === "name") {
    if (cleaned.length < 2 || cleaned.length > 80) {
      return { ok: false, message: "Please provide a full name between 2 and 80 characters." };
    }
    return { ok: true, value: cleaned };
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

export function validateFinalOnboardingState(state: Partial<OnboardingData>): ValidationResult<OnboardingData> {
  const requiredKeys: Array<keyof OnboardingData> = [
    "name",
    "title",
    "bio",
    "services",
    "projects",
    "tone",
    "handle",
  ];

  for (const key of requiredKeys) {
    if (state[key] === undefined || state[key] === null) {
      return { ok: false, message: `Missing onboarding field: ${key}` };
    }
  }

  return { ok: true, value: state as OnboardingData };
}
