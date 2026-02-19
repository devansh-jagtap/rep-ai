import { ONBOARDING_QUESTIONS, ONBOARDING_STEPS, type OnboardingStep } from "@/lib/onboarding/types";

export function getNextStep(step: OnboardingStep): OnboardingStep | null {
  const idx = ONBOARDING_STEPS.indexOf(step);
  if (idx === -1 || idx === ONBOARDING_STEPS.length - 1) {
    return null;
  }

  return ONBOARDING_STEPS[idx + 1];
}

export function getPreviousStep(step: OnboardingStep): OnboardingStep | null {
  const idx = ONBOARDING_STEPS.indexOf(step);
  if (idx <= 0) {
    return null;
  }

  return ONBOARDING_STEPS[idx - 1];
}

export function getQuestionForStep(step: OnboardingStep) {
  return ONBOARDING_QUESTIONS[step];
}
