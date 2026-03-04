"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
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
  OnboardingPreviewCard,
} from "@/app/onboarding/_components/onboarding-chat-parts";
import { lastMessageAsksConfirmation, userJustConfirmed } from "@/app/onboarding/_lib/onboarding-chat-utils";
import { useOnboardingChatState } from "@/app/onboarding/_hooks/use-onboarding-chat-state";
import type { OnboardingSelectedSections } from "@/lib/onboarding/types";
import { toast } from "sonner";
import { useOnboardingSelectorVisibility } from "@/app/onboarding/_hooks/use-onboarding-selector-visibility";
import { OnboardingChatMessageList } from "@/app/onboarding/_components/onboarding-chat-message-list";

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
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/onboarding/resume-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as { error?: string }).error || `Upload failed (${response.status})`);
      }

      const { publicUrl } = await response.json();

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

  const selectorVisibility = useOnboardingSelectorVisibility(messages);
  const { shouldShowAnyEnhancedUI } = selectorVisibility;

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
        <h1 className="text-lg">Mimick.me — Set up your portfolio</h1>
      </header>
      {error && <div className="bg-destructive/10 text-destructive px-4 py-2 text-sm">{error.message}</div>}

      <div className="relative md:mx-80 flex flex-1 flex-col overflow-hidden min-h-0">
        <Conversation className="flex-1 min-h-0">
          <ConversationContent className={cn("gap-4 p-4", previewData ? "pb-4" : asksConfirm ? "pb-32" : "pb-24")} scrollClassName="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {messages.length === 0 ? (
              <ConversationEmptyState icon={<MessageSquare className="size-12 text-muted-foreground" />} title="Let's get started" description="Type a message below to begin setting up your portfolio" />
            ) : (
              <OnboardingChatMessageList
                messages={messages}
                status={status}
                visibility={selectorVisibility}
                selectedSections={selectedSections}
                setSelectedSections={setSelectedSections}
                setSelectedServices={setSelectedServices}
                setSelectedProjects={setSelectedProjects}
                setHandleValue={setHandleValue}
                setSelectedFAQs={setSelectedFAQs}
                onSectionsSubmit={handleSectionsSubmit}
                onSetupPathSubmit={handleSetupPathSubmit}
                onToneSubmit={handleToneSubmit}
                onServicesSubmit={handleServicesSubmit}
                onProjectsSubmit={handleProjectsSubmit}
                onHandleSubmit={handleHandleSubmit}
                onTargetAudienceSubmit={handleTargetAudienceSubmit}
                onContactPreferenceSubmit={handleContactPreferenceSubmit}
                onFAQsSubmit={handleFAQsSubmit}
                onTitleSubmit={handleTitleSubmit}
                isSavingSections={isSavingSections}
              />
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {previewData ? (
          <div className="shrink-0 border-t bg-background/95 backdrop-blur p-4 md:py-6 overflow-y-auto max-h-[50dvh] md:max-h-[60dvh]">
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
