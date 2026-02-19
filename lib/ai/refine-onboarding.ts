import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { OnboardingStep } from "@/lib/onboarding/types";

const nebius = createOpenAI({
  apiKey: process.env.NEBIUS_API_KEY,
  baseURL: process.env.NEBIUS_BASE_URL ?? "https://api.studio.nebius.com/v1",
});

const MODEL = process.env.NEBIUS_MODEL ?? "meta-llama/Meta-Llama-3.1-70B-Instruct";

function getInstruction(step: OnboardingStep) {
  if (step === "bio") {
    return "Rewrite this bio to be concise, clear, and professional. Keep first person voice.";
  }

  if (step === "projects") {
    return "Rewrite each project description to be clear, specific, and professional while keeping the original meaning.";
  }

  if (step === "services") {
    return "Clean up the service list into concise professional phrases.";
  }

  return "Clean up this text for professional clarity while preserving the user's intent.";
}

export async function refineOnboardingAnswer(step: OnboardingStep, rawAnswer: string) {
  if (!process.env.NEBIUS_API_KEY) {
    return rawAnswer;
  }

  try {
    const response = await generateText({
      model: nebius(MODEL),
      temperature: 0.45,
      prompt: `${getInstruction(step)}\n\nReturn only the revised text.\n\nInput:\n${rawAnswer}`,
    });

    return response.text.trim() || rawAnswer;
  } catch (error) {
    console.error("Failed to refine onboarding answer", error);
    return rawAnswer;
  }
}
