import {
  ONBOARDING_QUESTIONS,
  ONBOARDING_STEPS,
  withDefaultSelectedSections,
  type OnboardingData,
  type OnboardingStep,
} from "@/lib/onboarding/types";

function shouldSkipStep(step: OnboardingStep, state?: Partial<OnboardingData>) {
  const withDefaults = withDefaultSelectedSections(state);
  const setupPath = withDefaults?.setupPath;
  const selectedSections = withDefaults?.selectedSections;

  if (step === "services") {
    return selectedSections?.services === false;
  }

  if (step === "projects") {
    return setupPath !== "build-new" || selectedSections?.projects === false;
  }

  if (step === "siteUrl" || step === "targetAudience") {
    return setupPath !== "existing-site";
  }

  if (step === "contactPreferences") {
    return setupPath !== "existing-site" || selectedSections?.cta === false;
  }

  if (step === "faqs") {
    return setupPath !== "existing-site" || selectedSections?.socials === false;
  }

  return false;
}

export function getNextStep(step: OnboardingStep, state?: Partial<OnboardingData>): OnboardingStep | null {
  const idx = ONBOARDING_STEPS.indexOf(step);
  if (idx === -1 || idx === ONBOARDING_STEPS.length - 1) {
    return null;
  }

  for (let i = idx + 1; i < ONBOARDING_STEPS.length; i += 1) {
    const candidate = ONBOARDING_STEPS[i];
    if (!shouldSkipStep(candidate, state)) {
      return candidate;
    }
  }

  return null;
}

export function getPreviousStep(step: OnboardingStep, state?: Partial<OnboardingData>): OnboardingStep | null {
  const idx = ONBOARDING_STEPS.indexOf(step);
  if (idx <= 0) {
    return null;
  }

  for (let i = idx - 1; i >= 0; i -= 1) {
    const candidate = ONBOARDING_STEPS[i];
    if (!shouldSkipStep(candidate, state)) {
      return candidate;
    }
  }

  return null;
}

export function getQuestionForStep(step: OnboardingStep) {
  return getQuestionForStep(step);
}
