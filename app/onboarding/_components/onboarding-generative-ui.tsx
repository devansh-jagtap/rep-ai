"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { OnboardingSelectorOption } from "@/lib/onboarding/types";
import { DEFAULT_ONBOARDING_SECTIONS } from "@/lib/onboarding/types";
import { AlertCircle, Check, Loader2, Plus, Trash2 } from "lucide-react";
import { IconComponent } from "./selectors/shared";

export { SetupPathSelector } from "./selectors/setup-path-selector";
export { SectionSelectorCards } from "./selectors/section-selector-cards";
export { ServicesTagSelector } from "./selectors/services-tag-selector";
export { ProjectsCardEditor } from "./selectors/projects-card-editor";

interface ContactPreferencesChipsProps {
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const CONTACT_OPTIONS = [
  { id: "email", label: "Email", icon: "mail" },
  { id: "calendly", label: "Calendly", icon: "calendar" },
  { id: "form", label: "Contact Form", icon: "form" },
  { id: "whatsapp", label: "WhatsApp", icon: "message" },
  { id: "phone", label: "Phone", icon: "phone" },
];

export function ContactPreferencesChips({ onSelect, disabled }: ContactPreferencesChipsProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CONTACT_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <Button
              key={option.id}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="rounded-full gap-2"
              onClick={() => handleSelect(option.id)}
              disabled={disabled}
            >
              <IconComponent name={option.icon} className="h-4 w-4" />
              {option.label}
            </Button>
          );
        })}
      </div>

      {selected && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Additional instructions (optional)
          </Label>
          <Textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Any specific instructions for handling contacts..."
            disabled={disabled}
            rows={2}
          />
        </div>
      )}
    </div>
  );
}

interface HandleInputWithValidationProps {
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  baseUrl?: string;
}

export function HandleInputWithValidation({ onChange, onSubmit, disabled, baseUrl = "Mimick.me.io" }: HandleInputWithValidationProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value || value.length < 3) {
      return;
    }

    const timeout = setTimeout(async () => {
      setStatus("checking");
      setError(null);

      if (!/^[a-z0-9-]+$/.test(value)) {
        setStatus("unavailable");
        setError("Only lowercase letters, numbers, and hyphens allowed");
        return;
      }

      try {
        const res = await fetch(`/api/check-handle?handle=${encodeURIComponent(value)}`);
        const data = await res.json();

        if (data.available) {
          setStatus("available");
          return;
        }

        setStatus("unavailable");
        setError("This handle is already taken");
      } catch {
        setStatus("idle");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setValue(val);

    if (!val || val.length < 3) {
      setStatus("idle");
      setError(null);
    }

    onChange(val);
  };

  const isValid = status === "available";

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          value={value}
          onChange={handleChange}
          placeholder="your-name"
          disabled={disabled}
          className={`pr-20 ${status === "available" ? "border-green-500" : status === "unavailable" ? "border-red-500" : ""}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          .{baseUrl}
        </div>
      </div>

      {status === "checking" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking availability...
        </div>
      )}

      {status === "available" && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check className="h-4 w-4" />
          Available!
        </div>
      )}

      {status === "unavailable" && error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {value && isValid && (
        <div className="flex justify-end">
          <Button onClick={onSubmit} disabled={disabled || !isValid} size="sm">
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}

interface TitleSuggestionsProps {
  suggestions?: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const DEFAULT_TITLE_SUGGESTIONS = [
  "Product Designer",
  "Software Engineer",
  "Frontend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Marketing Manager",
  "Consultant",
  "Freelancer",
  "Founder",
  "Data Scientist",
];

export function TitleSuggestions({
  suggestions = DEFAULT_TITLE_SUGGESTIONS,
  onSelect,
  disabled
}: TitleSuggestionsProps) {
  const [customValue, setCustomValue] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
          >
            {suggestion}
          </Button>
        ))}
      </div>

      <Separator />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">
          Or type your own:
        </Label>
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && customValue.trim()) {
              onSelect(customValue.trim());
            }
          }}
          placeholder="e.g. Senior Product Designer at Acme"
          disabled={disabled}
          className="flex-1"
        />
        {customValue.trim() && (
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              onClick={() => {
                onSelect(customValue.trim());
                setCustomValue("");
              }}
              disabled={disabled}
            >
              Use this title
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface TargetAudienceChipsProps {
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const AUDIENCE_OPTIONS = [
  { id: "startups", label: "Startups", icon: "sparkles" },
  { id: "enterprises", label: "Enterprises", icon: "briefcase" },
  { id: "smb", label: "Small Businesses", icon: "folder" },
  { id: "individuals", label: "Individual Clients", icon: "user" },
  { id: "agencies", label: "Agencies", icon: "layers" },
];

export function TargetAudienceChips({ onSelect, disabled }: TargetAudienceChipsProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customValue, setCustomValue] = useState("");

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {AUDIENCE_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <Button
              key={option.id}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="rounded-full gap-2"
              onClick={() => handleSelect(option.id)}
              disabled={disabled}
            >
              <IconComponent name={option.icon} className="h-4 w-4" />
              {option.label}
            </Button>
          );
        })}
      </div>

      <Separator />

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">
          Or describe your audience:
        </Label>
        <Textarea
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && customValue.trim() && !e.shiftKey) {
              e.preventDefault();
              onSelect(customValue.trim());
            }
          }}
          placeholder="Tech startups in the SaaS space looking for design help..."
          disabled={disabled}
          rows={2}
        />
        {customValue.trim() && (
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              onClick={() => {
                onSelect(customValue.trim());
                setCustomValue("");
              }}
              disabled={disabled}
            >
              Use this
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface FAQAccordionEditorProps {
  onChange: (faqs: string[]) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function FAQAccordionEditor({ onChange, onSubmit, disabled }: FAQAccordionEditorProps) {
  const [faqs, setFaqs] = useState<Array<{ id: string; question: string; answer: string }>>([
    { id: crypto.randomUUID(), question: "", answer: "" }
  ]);

  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFaqs(newFaqs);
    onChange(newFaqs.filter(f => f.question.trim()).map(f => `${f.question}: ${f.answer}`));
  };

  const addFaq = () => {
    setFaqs([...faqs, { id: crypto.randomUUID(), question: "", answer: "" }]);
  };

  const removeFaq = (index: number) => {
    if (faqs.length <= 1) return;
    const newFaqs = faqs.filter((_, i) => i !== index);
    setFaqs(newFaqs);
    onChange(newFaqs.filter(f => f.question.trim()).map(f => `${f.question}: ${f.answer}`));
  };

  const validFaqs = faqs.filter(f => f.question.trim());

  return (
    <div className="space-y-3">
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger className="text-sm">
              {faq.question || `FAQ ${index + 1}`}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Question</Label>
                  <Input
                    value={faq.question}
                    onChange={(e) => updateFaq(index, "question", e.target.value)}
                    placeholder="e.g. What industries do you work with?"
                    disabled={disabled}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Answer</Label>
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, "answer", e.target.value)}
                    placeholder="e.g. I primarily work with tech startups..."
                    disabled={disabled}
                    className="mt-1"
                    rows={2}
                  />
                </div>
                {faqs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeFaq(index)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={addFaq}
        disabled={disabled}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add FAQ
      </Button>

      {validFaqs.length > 0 && (
        <div className="flex justify-end pt-2">
          <Button onClick={onSubmit} disabled={disabled} size="sm">
            Continue ({validFaqs.length})
          </Button>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_ONBOARDING_SECTIONS };
