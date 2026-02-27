"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare, ArrowUpIcon, Paperclip, Upload, Loader2, CheckCircle } from "lucide-react";
import {
  getDefaultSectionSelection,
  OnboardingMessageResponse,
  OnboardingPreviewCard,
} from "@/app/onboarding/_components/onboarding-chat-parts";
import { lastMessageAsksConfirmation, userJustConfirmed, type MessagePartLike } from "@/app/onboarding/_lib/onboarding-chat-utils";
import { useOnboardingChatState } from "@/app/onboarding/_hooks/use-onboarding-chat-state";
import type { OnboardingSelectedSections } from "@/lib/onboarding/types";
import { toast } from "sonner";
import {
  SetupPathSelector,
  ToneSelectorCards,
  ServicesTagSelector,
  TargetAudienceChips,
  ContactPreferencesChips,
  HandleInputWithValidation,
  FAQAccordionEditor,
  ProjectsCardEditor,
  TitleSuggestions,
  SectionSelectorCards,
} from "@/app/onboarding/_components/onboarding-generative-ui";

export function OnboardingChat() {
  const {
    messages,
    status,
    error,
    input,
    setInput,
    sendMessage,
    previewData,
    isConfirming,
    handleConfirm,
    refreshDraftFromServer,
  } = useOnboardingChatState();
  const [selectedSections, setSelectedSections] = useState<OnboardingSelectedSections>(getDefaultSectionSelection());
  const [isSavingSections, setIsSavingSections] = useState(false);

  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const resumeSentRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<{ title: string; description: string }[]>([]);
  const [handleValue, setHandleValue] = useState("");
  const [selectedFAQs, setSelectedFAQs] = useState<string[]>([]);

  const getMessageText = useCallback((message: { parts?: MessagePartLike[]; content?: string; role: string }) => {
    if (message.role !== "assistant") return "";
    const parts = (message.parts || []) as MessagePartLike[];
    const textFromParts = parts
      .filter((part): part is { type: "text"; text: string } => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join(" ");
    const textFromContent = typeof message.content === "string" ? message.content : "";
    return (textFromParts + " " + textFromContent).toLowerCase();
  }, []);

  const handleResumeUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploadingResume(true);
    try {
      const uploadUrlResponse = await fetch(
        `/api/onboarding/resume-upload?fileName=${encodeURIComponent(file.name)}&mimeType=${encodeURIComponent(file.type)}`,
        { method: "POST" }
      );

      if (!uploadUrlResponse.ok) {
        const errorData = await uploadUrlResponse.json();
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      const { uploadUrl, publicUrl } = await uploadUrlResponse.json();

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      setResumeUrl(publicUrl);
      setShowUpload(false);
      toast.success("Resume uploaded! Send a message to attach it.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const asksConfirm = useMemo(() => lastMessageAsksConfirmation(messages), [messages]);
  const stuckAfterConfirm = useMemo(() => userJustConfirmed(messages), [messages]);

  const handleLocalSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (status === "streaming") return;

    // If no text AND no resume, do nothing
    if (!text && !resumeUrl) return;

    if (resumeUrl && !resumeSentRef.current) {
      const userText = text || "Here is my resume, please extract my details from it.";
      sendMessage({ text: `[Attached Resume: pdf-url](${resumeUrl})\n\n${userText}` });
      resumeSentRef.current = true;
    } else {
      if (!text) return;
      sendMessage({ text });
    }
    setInput("");
    setShowUpload(false);
  }, [input, resumeUrl, sendMessage, setInput, status]);

  // Detect only from the latest assistant message so enhanced UI appears in an orderly, step-by-step way.
  const detectedStep = useMemo(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return null;

    const text = getMessageText(last);
    if (!text.trim()) return null;

    if (text.includes("how would you like to get started") || text.includes("already have a website") || text.includes("build me a portfolio")) {
      return "setup" as const;
    }

    if (text.includes("what services") || text.includes("services or work do you offer")) {
      return "services" as const;
    }

    if (text.includes("tell me about 1-3 projects") || text.includes("projects you'd like to showcase")) {
      return "projects" as const;
    }

    if (text.includes("target audience") || text.includes("who is your target audience")) {
      return "target" as const;
    }

    if (text.includes("how should contacts reach you") || text.includes("reach you")) {
      return "contact" as const;
    }

    if (text.includes("add faqs") || text.includes("frequently asked")) {
      return "faqs" as const;
    }

    if (text.includes("choose your preferred tone") || text.includes("preferred tone")) {
      return "tone" as const;
    }

    if (text.includes("choose your public handle") || text.includes("public handle")) {
      return "handle" as const;
    }

    if (text.includes("which sections") || (text.includes("sections") && text.includes("hero"))) {
      return "sections" as const;
    }

    if (text.includes("professional title") || text.includes("title best describes")) {
      return "title" as const;
    }

    return null;
  }, [messages, getMessageText]);

  // Map detected step to individual booleans
  const shouldShowSetupPath = detectedStep === "setup";
  const shouldShowTitleSuggestions = detectedStep === "title";
  const shouldShowSectionSelector = detectedStep === "sections";
  const shouldShowServicesSelector = detectedStep === "services";
  const shouldShowProjectsEditor = detectedStep === "projects";
  const shouldShowTargetAudience = detectedStep === "target";
  const shouldShowContactPreferences = detectedStep === "contact";
  const shouldShowFAQsEditor = detectedStep === "faqs";
  const shouldShowToneSelector = detectedStep === "tone";
  const shouldShowHandleInput = detectedStep === "handle";

  const shouldShowAnyEnhancedUI = shouldShowSectionSelector || shouldShowSetupPath || shouldShowToneSelector || 
    shouldShowServicesSelector || shouldShowProjectsEditor || shouldShowHandleInput || 
    shouldShowTargetAudience || shouldShowContactPreferences || shouldShowFAQsEditor || shouldShowTitleSuggestions;

  const handleSectionsSubmit = async () => {
    setIsSavingSections(true);
    try {
      await fetch("/api/onboarding/draft", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedSections }),
      });
      const asText = `about:${selectedSections.about ? "on" : "off"}, services:${selectedSections.services ? "on" : "off"}, projects:${selectedSections.projects ? "on" : "off"}, cta:${selectedSections.cta ? "on" : "off"}, socials:${selectedSections.socials ? "on" : "off"}`;
      sendMessage({ text: asText });
    } finally {
      setIsSavingSections(false);
    }
  };

  const handleSetupPathSubmit = (value: string) => {
    sendMessage({ text: value });
  };

  const handleToneSubmit = (value: string) => {
    sendMessage({ text: value });
  };

  const handleServicesSubmit = () => {
    const asText = selectedServices.join(", ");
    sendMessage({ text: asText });
  };

  const handleProjectsSubmit = () => {
    const asText = selectedProjects.map(p => `${p.title}: ${p.description}`).join("\n");
    sendMessage({ text: asText });
  };

  const handleHandleSubmit = () => {
    sendMessage({ text: handleValue });
  };

  const handleTargetAudienceSubmit = (value: string) => {
    sendMessage({ text: value });
  };

  const handleContactPreferenceSubmit = (value: string) => {
    sendMessage({ text: value });
  };

  const handleFAQsSubmit = () => {
    sendMessage({ text: selectedFAQs.join("\n") });
  };

  const handleTitleSubmit = (value: string) => {
    sendMessage({ text: value });
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      <header className="flex shrink-0 items-center justify-center border-b px-4 py-3">
        <h1 className="font-semibold text-lg">ref — Set up your portfolio</h1>
      </header>
      {error && <div className="bg-destructive/10 text-destructive px-4 py-2 text-sm">{error.message}</div>}

      <div className="relative md:mx-80 flex flex-1 flex-col overflow-hidden min-h-0">
        <Conversation className="flex-1 min-h-0">
          <ConversationContent className={cn("gap-4 p-4", previewData ? "pb-4" : asksConfirm ? "pb-32" : "pb-24")} scrollClassName="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {messages.length === 0 ? (
              <ConversationEmptyState icon={<MessageSquare className="size-12 text-muted-foreground" />} title="Let's get started" description="Type a message below to begin setting up your portfolio" />
            ) : (
              messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent className={cn("text-base max-w-2xl", message.role === "assistant" && "text-primary")}>
                    {(() => {
                      const messageParts = (message.parts || []) as MessagePartLike[];
                      if (messageParts.length === 0 && typeof message.content === "string") {
                        const cleaned = message.content.replace(/\[Attached Resume:[^\]]*\]\([^\)]+\)/g, "").trim();
                        return cleaned ? <OnboardingMessageResponse key={`${message.id}-content`}>{cleaned}</OnboardingMessageResponse> : null;
                      }

                      const textParts = messageParts.filter((part): part is { type: "text"; text: string } => part.type === "text" && typeof part.text === "string");
                      return (
                        <>
                          {textParts.map((part, index) => {
                            const displayTxt = part.text.replace(/\[Attached Resume:[^\]]*\]\([^\)]+\)/g, '').trim();
                            if (!displayTxt) return null;
                            return <OnboardingMessageResponse key={`${message.id}-${index}`}>{displayTxt}</OnboardingMessageResponse>;
                          })}

                          {message.role === "assistant" && shouldShowSectionSelector && message.id === messages[messages.length - 1]?.id ? (
                            <div className="mt-3">
                              <SectionSelectorCards
                                value={selectedSections}
                                onChange={setSelectedSections}
                                onSubmit={handleSectionsSubmit}
                                disabled={status === "streaming" || isSavingSections}
                              />
                            </div>
                          ) : null}
                          {message.role === "assistant" && shouldShowSetupPath && message.id === messages[messages.length - 1]?.id ? (
                            <div className="mt-3">
                              <SetupPathSelector
                                options={[
                                  { id: "existing-site", label: "Agent Rep Only", value: "I already have a website", description: "Quick 2-min setup • Connect your existing website with an AI agent", icon: "bot", color: "blue" },
                                  { id: "build-new", label: "Agent Rep + Portfolio", value: "Build me a portfolio + agent", description: "Full portfolio site • AI-powered agent included", icon: "globe", color: "green" },
                                ]}
                                onSelect={handleSetupPathSubmit}
                                disabled={status === "streaming"}
                              />
                            </div>
                          ) : null}
                          {message.role === "assistant" && shouldShowToneSelector && message.id === messages[messages.length - 1]?.id ? (
                            <div className="mt-3">
                              <ToneSelectorCards
                                options={[
                                  { id: "professional", label: "Professional", value: "Professional", description: '"I help enterprise teams build scalable solutions."', icon: "briefcase" },
                                  { id: "friendly", label: "Friendly", value: "Friendly", description: '"Hey there! I\'d love to help you with your project."', icon: "smile" },
                                  { id: "bold", label: "Bold", value: "Bold", description: '"I don\'t just design products—I transform businesses."', icon: "zap" },
                                  { id: "minimal", label: "Minimal", value: "Minimal", description: '"I design clean, focused solutions."', icon: "minus" },
                                ]}
                                onSelect={handleToneSubmit}
                                disabled={status === "streaming"}
                              />
                            </div>
                          ) : null}
                          {message.role === "assistant" && shouldShowServicesSelector && message.id === messages[messages.length - 1]?.id ? (
                            <div className="mt-3">
                              <ServicesTagSelector
                                presets={["Web Development", "Mobile App Development", "UI/UX Design", "Graphic Design", "Content Writing", "Marketing", "SEO", "Social Media Management", "Consulting", "Data Analytics", "Video Production", "Photography"]}
                                onChange={setSelectedServices}
                                onSubmit={handleServicesSubmit}
                                disabled={status === "streaming"}
                                max={10}
                              />
                            </div>
                          ) : null}
                          {message.role === "assistant" && shouldShowProjectsEditor && message.id === messages[messages.length - 1]?.id ? (
                            <div className="mt-3">
                              <ProjectsCardEditor
                                onChange={setSelectedProjects}
                                onSubmit={handleProjectsSubmit}
                                disabled={status === "streaming"}
                                maxItems={3}
                              />
                            </div>
                          ) : null}
                          {message.role === "assistant" && shouldShowHandleInput && message.id === messages[messages.length - 1]?.id ? (
                            <div className="mt-3">
                              <HandleInputWithValidation
                                onChange={setHandleValue}
                                onSubmit={handleHandleSubmit}
                                disabled={status === "streaming"}
                              />
                            </div>
                          ) : null}
                          {message.role === "assistant" && shouldShowTargetAudience && message.id === messages[messages.length - 1]?.id ? (
                            <div className="mt-3">
                              <TargetAudienceChips
                                onSelect={handleTargetAudienceSubmit}
                                disabled={status === "streaming"}
                              />
                            </div>
                          ) : null}
                          {message.role === "assistant" && shouldShowContactPreferences && message.id === messages[messages.length - 1]?.id ? (
                            <div className="mt-3">
                              <ContactPreferencesChips
                                onSelect={handleContactPreferenceSubmit}
                                disabled={status === "streaming"}
                              />
                            </div>
                          ) : null}
                          {message.role === "assistant" && shouldShowFAQsEditor && message.id === messages[messages.length - 1]?.id ? (
                            <div className="mt-3">
                              <FAQAccordionEditor
                                onChange={setSelectedFAQs}
                                onSubmit={handleFAQsSubmit}
                                disabled={status === "streaming"}
                              />
                            </div>
                          ) : null}
                          {message.role === "assistant" && shouldShowTitleSuggestions && message.id === messages[messages.length - 1]?.id ? (
                            <div className="mt-3">
                              <TitleSuggestions
                                suggestions={["Product Designer", "Software Engineer", "Frontend Developer", "Full Stack Developer", "UI/UX Designer", "Marketing Manager", "Consultant", "Freelancer", "Founder", "Data Scientist"]}
                                onSelect={handleTitleSubmit}
                                disabled={status === "streaming"}
                              />
                            </div>
                          ) : null}
                        </>
                      );
                    })()}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {previewData ? (
          <div className="shrink-0 border-t bg-background/95 backdrop-blur px-4 py-6">
            <div className="mx-auto max-w-3xl space-y-4">
              <p className="text-muted-foreground text-center text-sm">Review your portfolio below. Click Edit to change something, or Confirm when ready.</p>
              <OnboardingPreviewCard data={previewData} onConfirm={handleConfirm} onEdit={() => document.getElementById("onboarding-edit-input")?.focus()} isConfirming={isConfirming} />
              <form onSubmit={handleLocalSubmit}>
                <InputGroup className="max-w-3xl">
                  <InputGroupInput id="onboarding-edit-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="What would you like to change? (e.g. shorten the bio, change title to Senior Developer)" disabled={status === "streaming"} className="text-base" />
                  <InputGroupAddon align="inline-end"><InputGroupButton type="submit" variant="default" size="icon-sm" disabled={!input.trim() || status === "streaming"}><ArrowUpIcon className="size-4" /></InputGroupButton></InputGroupAddon>
                </InputGroup>
              </form>
            </div>
          </div>
        ) : (
          <div className="shrink-0 p-4 space-y-2 border-t">
            {stuckAfterConfirm && status !== "streaming" && (
              <div className="mx-auto flex max-w-3xl justify-center">
                <Button type="button" variant="secondary" size="sm" className="rounded-full" onClick={refreshDraftFromServer}>
                  Show preview
                </Button>
              </div>
            )}
            {asksConfirm && status !== "streaming" && !stuckAfterConfirm && (
              <div className="mx-auto flex max-w-3xl justify-center gap-2">
                <Button type="button" variant="secondary" size="sm" className="rounded-full" onClick={() => sendMessage({ text: "Yes, looks good!" })}>Yes, looks good</Button>
                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => sendMessage({ text: "No, let me change that" })}>No, let me change</Button>
              </div>
            )}
            <form onSubmit={handleLocalSubmit} className="space-y-3">
              {/* Upload drop zone */}
              {showUpload && !resumeUrl && (
                <div className="mx-auto max-w-3xl">
                  {isUploadingResume ? (
                    <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg">
                      <Loader2 className="size-5 animate-spin" />
                      <span className="text-sm text-muted-foreground">Uploading resume...</span>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="size-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload PDF resume</p>
                      <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleResumeUpload(file);
                    }}
                    disabled={status === "streaming" || isUploadingResume}
                  />
                </div>
              )}

              {/* Resume uploaded badge */}
              {resumeUrl && !resumeSentRef.current && (
                <div className="mx-auto max-w-3xl flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-md text-sm font-medium">
                  <CheckCircle className="size-4" />
                  Resume uploaded! Send a message (or just hit enter) to attach it.
                  <Button type="button" variant="ghost" size="sm" className="ml-auto p-0 h-auto" onClick={() => { setResumeUrl(null); setShowUpload(false); }}>
                    Remove
                  </Button>
                </div>
              )}

              {/* Input bar */}
              <InputGroup className="mx-auto max-w-3xl">
                <InputGroupAddon align="inline-start">
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground"
                    onClick={() => setShowUpload(prev => !prev)}
                    title="Upload Resume PDF for autofill"
                    disabled={shouldShowAnyEnhancedUI}
                  >
                    <Paperclip className="size-4" />
                  </InputGroupButton>
                </InputGroupAddon>
                <InputGroupInput value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message or upload a resume..." disabled={status === "streaming" || shouldShowAnyEnhancedUI} className="text-base md:text-base pl-1" />
                <InputGroupAddon align="inline-end"><InputGroupButton type="submit" variant="default" size="icon-sm" disabled={(!input.trim() && !resumeUrl) || status === "streaming" || shouldShowAnyEnhancedUI}><ArrowUpIcon className="size-4" /></InputGroupButton></InputGroupAddon>
              </InputGroup>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
