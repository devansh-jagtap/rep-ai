"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingInput } from "@/components/onboarding/onboarding-input";
import { ONBOARDING_STEPS, type OnboardingData, type OnboardingProjectInput, type OnboardingStep } from "@/lib/onboarding/types";
import { getPreviousStep, getQuestionForStep } from "@/lib/onboarding/state-machine";

function createMessage(role: "assistant" | "user", text: string) {
  return {
    id: crypto.randomUUID(),
    role,
    parts: [{ type: "text" as const, text }],
  };
}

export function OnboardingChat() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("name");
  const [onboardingState, setOnboardingState] = useState<Partial<OnboardingData>>({});
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [projects, setProjects] = useState<OnboardingProjectInput[]>([{ title: "", description: "" }]);
  const [handleStatus, setHandleStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const { messages, setMessages } = useChat({
    id: "onboarding-chat",
    messages: [createMessage("assistant", getQuestionForStep("name"))],
  });

  const progress = useMemo(
    () => Math.round(((ONBOARDING_STEPS.indexOf(currentStep) + 1) / ONBOARDING_STEPS.length) * 100),
    [currentStep]
  );

  function hydrateInput(step: OnboardingStep, state: Partial<OnboardingData>) {
    if (step === "projects") {
      setProjects(state.projects ?? [{ title: "", description: "" }]);
      setInputValue(
        (state.projects ?? [])
          .map((project) => `${project.title}: ${project.description}`)
          .join("\n")
      );
      return;
    }

    setInputValue(String(state[step] ?? ""));
  }

  async function submitStep() {
    setError(null);
    if (!inputValue.trim()) {
      setError("Please add a response before continuing.");
      return;
    }

    if (currentStep === "handle") {
      setHandleStatus("checking");
    }

    const userText = inputValue.trim();
    setMessages((prev) => [...prev, createMessage("user", userText)]);

    const response = await fetch("/api/onboarding-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: currentStep,
        answer: userText,
        state: onboardingState,
      }),
    });

    const payload = (await response.json()) as {
      ok: boolean;
      error?: string;
      step: OnboardingStep;
      nextStep: OnboardingStep | null;
      assistantMessage: string;
      state: Partial<OnboardingData>;
      refinedAnswer?: string;
      completed: boolean;
    };

    if (!payload.ok) {
      if (currentStep === "handle") {
        setHandleStatus("taken");
      }
      setError(payload.error ?? "Something went wrong. Please try again.");
      return;
    }

    if (currentStep === "handle") {
      setHandleStatus("available");
    }

    setOnboardingState(payload.state);
    setMessages((prev) => [...prev, createMessage("assistant", payload.assistantMessage)]);

    if (payload.completed) {
      startTransition(async () => {
        const completeResponse = await fetch("/api/onboarding-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: payload.state }),
        });

        const completePayload = (await completeResponse.json()) as {
          ok: boolean;
          error?: string;
          redirectTo?: string;
        };

        if (!completePayload.ok || !completePayload.redirectTo) {
          setError(completePayload.error ?? "Unable to save onboarding data.");
          return;
        }

        router.push(completePayload.redirectTo);
      });
      return;
    }

    setCurrentStep(payload.nextStep as OnboardingStep);
    setInputValue("");
    setProjects([{ title: "", description: "" }]);
  }

  function goBack() {
    const prev = getPreviousStep(currentStep);
    if (!prev) {
      return;
    }

    setCurrentStep(prev);
    hydrateInput(prev, onboardingState);
    setError(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to preffer.me</CardTitle>
        <p className="text-sm text-muted-foreground">Progress: {progress}%</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-[320px] space-y-3 overflow-y-auto rounded-md border p-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-md px-3 py-2 text-sm ${
                message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
              }`}
            >
              {message.parts
                .filter((part) => part.type === "text")
                .map((part, index) => (
                  <p key={`${message.id}-${index}`}>{part.text}</p>
                ))}
            </div>
          ))}
        </div>

        <OnboardingInput
          step={currentStep}
          value={inputValue}
          projects={projects}
          toneValue={String(onboardingState.tone ?? "")}
          handleStatus={handleStatus}
          onChange={setInputValue}
          onProjectsChange={setProjects}
          onToneSelect={setInputValue}
        />

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={goBack} disabled={!getPreviousStep(currentStep)}>
            Back
          </Button>
          <Button type="button" onClick={submitStep} disabled={isPending}>
            {isPending ? "Saving..." : "Continue"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
