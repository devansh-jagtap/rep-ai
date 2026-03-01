"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { OnboardingSelectorOption, OnboardingSelectedSections, OnboardingProjectInput } from "@/lib/onboarding/types";
import { DEFAULT_ONBOARDING_SECTIONS } from "@/lib/onboarding/types";
import { 
  Bot, Globe, Briefcase, Smile, Zap, Minus, X, Plus, Trash2, Check, AlertCircle, Loader2,
  User, Info, Target, Mail, Calendar, FormInput, Phone, MessageCircle, ExternalLink,
  Sparkles, Layers, Folder, Clock
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  bot: Bot,
  globe: Globe,
  briefcase: Briefcase,
  smile: Smile,
  zap: Zap,
  minus: Minus,
  user: User,
  info: Info,
  target: Target,
  mail: Mail,
  calendar: Calendar,
  form: FormInput,
  phone: Phone,
  message: MessageCircle,
  link: ExternalLink,
  sparkles: Sparkles,
  layers: Layers,
  folder: Folder,
  clock: Clock,
};

function IconComponent({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

const colorMap: Record<string, string> = {
  blue: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
  green: "border-green-500 bg-green-50 dark:bg-green-950/30",
  purple: "border-purple-500 bg-purple-50 dark:bg-purple-950/30",
  orange: "border-orange-500 bg-orange-50 dark:bg-orange-950/30",
  red: "border-red-500 bg-red-50 dark:bg-red-950/30",
  cyan: "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30",
};

const iconContainerColorMap: Record<string, string> = {
  blue: "bg-blue-100 dark:bg-blue-900/50",
  green: "bg-green-100 dark:bg-green-900/50",
  purple: "bg-purple-100 dark:bg-purple-900/50",
  orange: "bg-orange-100 dark:bg-orange-900/50",
  red: "bg-red-100 dark:bg-red-900/50",
  cyan: "bg-cyan-100 dark:bg-cyan-900/50",
};

interface SetupPathSelectorProps {
  options: OnboardingSelectorOption[];
  onSelect: (value: string, optionId: string) => void;
  disabled?: boolean;
}

export function SetupPathSelector({ options, onSelect, disabled }: SetupPathSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: OnboardingSelectorOption) => {
    setSelected(option.id);
    onSelect(option.value, option.id);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {options.map((option) => {
        const isSelected = selected === option.id;
        const colorClass = option.color ? colorMap[option.color] || "" : "";
        
        return (
          <Card
            key={option.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
            } ${colorClass}`}
            onClick={() => !disabled && handleSelect(option)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${option.color ? iconContainerColorMap[option.color] || "bg-muted" : "bg-muted"}`}>
                  <IconComponent name={option.icon} className="w-6 h-6" />
                </div>
                {isSelected && <Check className="w-5 h-5 text-primary" />}
              </div>
              <CardTitle className="text-lg mt-3">{option.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {option.description}
              </CardDescription>
            </CardContent>
            <CardFooter className="pt-0">
              {isSelected && (
                <Badge variant="secondary" className="text-xs">
                  Selected
                </Badge>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

interface SectionSelectorCardsProps {
  value: OnboardingSelectedSections;
  onChange: (next: OnboardingSelectedSections) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const SECTION_CONFIG: Array<{
  key: keyof OnboardingSelectedSections;
  label: string;
  icon: string;
  description: string;
  locked?: boolean;
}> = [
  { key: "hero", label: "Hero", icon: "user", description: "Your name & title", locked: true },
  { key: "about", label: "About", icon: "info", description: "Your bio & story" },
  { key: "services", label: "Services", icon: "briefcase", description: "What you offer" },
  { key: "projects", label: "Projects", icon: "folder", description: "Your work samples" },
  { key: "cta", label: "CTA", icon: "sparkles", description: "Call to action" },
  { key: "socials", label: "Socials", icon: "link", description: "Links & contact" },
];

export function SectionSelectorCards({ value, onChange, onSubmit, disabled }: SectionSelectorCardsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTION_CONFIG.map((section) => {
          const isEnabled = value[section.key];
          
          return (
            <Card
              key={section.key}
              className={`cursor-pointer transition-all duration-200 ${
                isEnabled 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/30"
              } ${section.locked ? "opacity-80" : ""}`}
              onClick={() => {
                if (disabled || section.locked) return;
                onChange({ ...value, [section.key]: !isEnabled });
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isEnabled ? "bg-primary/10" : "bg-muted"}`}>
                    <IconComponent name={section.icon} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{section.label}</p>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isEnabled ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}>
                        {isEnabled && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                    {section.locked && (
                      <Badge variant="outline" className="text-[10px] mt-2">Always on</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="flex justify-end pt-2">
        <Button onClick={onSubmit} disabled={disabled} size="sm">
          Continue
        </Button>
      </div>
    </div>
  );
}

interface ToneSelectorCardsProps {
  options: OnboardingSelectorOption[];
  onSelect: (value: string, optionId: string) => void;
  disabled?: boolean;
}

export function ToneSelectorCards({ options, onSelect, disabled }: ToneSelectorCardsProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: OnboardingSelectorOption) => {
    setSelected(option.id);
    onSelect(option.value, option.id);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selected === option.id;
          
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-border hover:border-primary/30"
              }`}
              onClick={() => !disabled && handleSelect(option)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent name={option.icon} className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-base">{option.label}</CardTitle>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">
                  &ldquo;{option.description}&rdquo;
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

interface ServicesTagSelectorProps {
  presets?: string[];
  onChange: (tags: string[]) => void;
  onSubmit: () => void;
  disabled?: boolean;
  max?: number;
}

export function ServicesTagSelector({ presets = [], onChange, onSubmit, disabled, max = 10 }: ServicesTagSelectorProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= max) return;
    const newTags = [...tags, trimmed];
    setTags(newTags);
    onChange(newTags);
    setCustomInput("");
  }, [tags, max, onChange]);

  const removeTag = useCallback((tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    onChange(newTags);
  }, [tags, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(customInput);
    }
  };

  return (
    <div className="space-y-4">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="h-4 w-4 ml-1"
                onClick={() => removeTag(tag)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add custom service..."
          disabled={disabled || tags.length >= max}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addTag(customInput)}
          disabled={disabled || !customInput.trim() || tags.length >= max}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {presets.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground mb-2">Or choose from:</p>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={tags.includes(preset) ? "default" : "outline"}
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => {
                    if (tags.includes(preset)) {
                      removeTag(preset);
                    } else {
                      addTag(preset);
                    }
                  }}
                  disabled={disabled || (tags.length >= max && !tags.includes(preset))}
                >
                  {tags.includes(preset) && <Check className="h-3 w-3 mr-1" />}
                  {preset}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end pt-2">
        <Button onClick={onSubmit} disabled={disabled || tags.length === 0} size="sm">
          Continue
        </Button>
      </div>
    </div>
  );
}

interface ProjectsCardEditorProps {
  onChange: (projects: OnboardingProjectInput[]) => void;
  onSubmit: () => void;
  disabled?: boolean;
  maxItems?: number;
}

export function ProjectsCardEditor({ onChange, onSubmit, disabled, maxItems = 3 }: ProjectsCardEditorProps) {
  const [projects, setProjects] = useState<OnboardingProjectInput[]>([
    { title: "", description: "" }
  ]);

  const updateProject = (index: number, field: keyof OnboardingProjectInput, value: string) => {
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setProjects(newProjects);
    onChange(newProjects.filter(p => p.title.trim()));
  };

  const addProject = () => {
    if (projects.length >= maxItems) return;
    setProjects([...projects, { title: "", description: "" }]);
  };

  const removeProject = (index: number) => {
    if (projects.length <= 1) return;
    const newProjects = projects.filter((_, i) => i !== index);
    setProjects(newProjects);
    onChange(newProjects.filter(p => p.title.trim()));
  };

  const validProjects = projects.filter(p => p.title.trim());

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <Card key={index} className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => removeProject(index)}
            disabled={disabled || projects.length <= 1}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <CardContent className="pt-4 space-y-3">
            <div>
              <Label htmlFor={`project-title-${index}`} className="text-xs text-muted-foreground">
                Project Title
              </Label>
              <Input
                id={`project-title-${index}`}
                value={project.title}
                onChange={(e) => updateProject(index, "title", e.target.value)}
                placeholder="E-commerce Platform Redesign"
                disabled={disabled}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`project-desc-${index}`} className="text-xs text-muted-foreground">
                Description
              </Label>
              <Textarea
                id={`project-desc-${index}`}
                value={project.description}
                onChange={(e) => updateProject(index, "description", e.target.value)}
                placeholder="Brief description of what you built..."
                disabled={disabled}
                className="mt-1"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {projects.length < maxItems && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addProject}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Project
        </Button>
      )}

      <div className="flex justify-end pt-2">
        <Button 
          onClick={onSubmit} 
          disabled={disabled || validProjects.length === 0} 
          size="sm"
        >
          Continue ({validProjects.length} project{validProjects.length !== 1 ? 's' : ''})
        </Button>
      </div>
    </div>
  );
}

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

export function HandleInputWithValidation({ onChange, onSubmit, disabled, baseUrl = "Envoy.io" }: HandleInputWithValidationProps) {
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
