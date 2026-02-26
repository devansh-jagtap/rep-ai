import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { refineOnboardingAnswer } from "@/lib/ai/refine-onboarding";
import { getPortfolioByHandle } from "@/lib/db/portfolio";
import { getNextStep, getQuestionForStep } from "@/lib/onboarding/state-machine";
import type { OnboardingChatRequest, OnboardingStep } from "@/lib/onboarding/types";
import { validateStepInput } from "@/lib/onboarding/validation";

function badRequest(message: string) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status: 400 }
  );
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: OnboardingChatRequest;
  try {
    body = (await request.json()) as OnboardingChatRequest;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const currentStep = body.step as OnboardingStep;
  if (!currentStep || !body.answer || typeof body.answer !== "string") {
    return badRequest("Missing step or answer.");
  }

  const validation = validateStepInput(currentStep, body.answer);
  if (!validation.ok) {
    return badRequest(validation.message);
  }

  if (currentStep === "handle") {
    try {
      const existing = await getPortfolioByHandle(validation.value as string);
      if (existing) {
        return badRequest("This handle is already taken. Please choose another one.");
      }
    } catch (error) {
      console.error("Failed while checking handle availability", error);
      return NextResponse.json(
        { ok: false, error: "Unable to validate handle right now." },
        { status: 500 }
      );
    }
  }

  const nextStep = getNextStep(currentStep);
  const nextQuestionConfig = nextStep ? getQuestionForStep(nextStep) : null;
  const nextAssistantMessage = nextQuestionConfig?.blocks[0]?.prompt
    ?? "Perfect. You are done with onboarding. Saving your portfolio now.";

  const shouldRefine = ["name", "title", "bio", "services", "projects"].includes(currentStep);

  let finalValue: unknown = validation.value;
  let refinedAnswer = String(validation.value);

  if (shouldRefine) {
    refinedAnswer = await refineOnboardingAnswer(currentStep, body.answer);
    const refinedValidation = validateStepInput(currentStep, refinedAnswer);
    if (refinedValidation.ok) {
      finalValue = refinedValidation.value;
    }
  }

  const mergedState = {
    ...(body?.state ?? {}),
    [currentStep]: finalValue,
  };

  return NextResponse.json({
    ok: true,
    step: currentStep,
    nextStep,
    assistantMessage: nextAssistantMessage,
    assistantBlocks: nextQuestionConfig?.blocks ?? [],
    state: mergedState,
    refinedAnswer,
    completed: nextStep === null,
  });
}
