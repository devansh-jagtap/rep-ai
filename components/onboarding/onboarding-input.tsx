"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OnboardingProjectInput, OnboardingStep } from "@/lib/onboarding/types";

interface OnboardingInputProps {
  step: OnboardingStep;
  value: string;
  projects: OnboardingProjectInput[];
  toneValue: string;
  handleStatus: "idle" | "checking" | "available" | "taken";
  onChange: (value: string) => void;
  onProjectsChange: (projects: OnboardingProjectInput[]) => void;
  onToneSelect: (tone: string) => void;
}

function projectToText(projects: OnboardingProjectInput[]) {
  return projects
    .filter((project) => project.title && project.description)
    .map((project) => `${project.title}: ${project.description}`)
    .join("\n");
}

export function OnboardingInput({
  step,
  value,
  projects,
  toneValue,
  handleStatus,
  onChange,
  onProjectsChange,
  onToneSelect,
}: OnboardingInputProps) {
  if (step === "services") {
    return (
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        placeholder="Web app development\nAPI integrations\nAutomation"
      />
    );
  }

  if (step === "projects") {
    const mergedProjects = projects.length > 0 ? projects : [{ title: "", description: "" }];

    return (
      <div className="space-y-3">
        {mergedProjects.map((project, index) => (
          <div key={`project-${index}`} className="space-y-2 rounded-md border p-3">
            <Label>Project {index + 1}</Label>
            <Input
              value={project.title}
              onChange={(event) => {
                const next = [...mergedProjects];
                next[index] = { ...next[index], title: event.target.value };
                onProjectsChange(next);
                onChange(projectToText(next));
              }}
              placeholder="Project title"
            />
            <Textarea
              value={project.description}
              onChange={(event) => {
                const next = [...mergedProjects];
                next[index] = { ...next[index], description: event.target.value };
                onProjectsChange(next);
                onChange(projectToText(next));
              }}
              placeholder="Project description"
              rows={3}
            />
          </div>
        ))}

        {mergedProjects.length < 3 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => onProjectsChange([...mergedProjects, { title: "", description: "" }])}
          >
            Add project
          </Button>
        ) : null}
      </div>
    );
  }

  if (step === "tone") {
    const tones = ["Professional", "Friendly", "Bold", "Minimal"];
    return (
      <div className="flex flex-wrap gap-2">
        {tones.map((tone) => (
          <Button
            key={tone}
            type="button"
            variant={toneValue === tone ? "default" : "outline"}
            onClick={() => {
              onToneSelect(tone);
              onChange(tone);
            }}
          >
            {tone}
          </Button>
        ))}
      </div>
    );
  }

  if (step === "handle") {
    return (
      <div className="space-y-2">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="your-handle"
          minLength={3}
          maxLength={30}
        />
        <p className="text-xs text-muted-foreground">
          {handleStatus === "checking"
            ? "Checking handle availability..."
            : handleStatus === "available"
              ? "Handle is available."
              : handleStatus === "taken"
                ? "Handle is taken. Try another one."
                : "Use lowercase letters, numbers, and hyphens only."}
        </p>
      </div>
    );
  }

  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={
        step === "name"
          ? "e.g. Jane Doe"
          : step === "title"
            ? "e.g. Senior Product Designer"
            : "Write your response"
      }
    />
  );
}
