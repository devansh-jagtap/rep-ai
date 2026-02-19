"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageSquare, ArrowUpIcon, CheckIcon } from "lucide-react";
import type { OnboardingData } from "@/lib/onboarding/types";
import { validateFinalOnboardingState } from "@/lib/onboarding/validation";
import {
  JSXPreview,
  JSXPreviewContent,
  JSXPreviewError,
} from "@/components/ai-elements/jsx-preview";

function OnboardingMessageResponse({ children }: { children: string }) {
  return (
    <Streamdown
      className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
      plugins={{ cjk }}
      controls={{ code: false, mermaid: false }}
    >
      {children}
    </Streamdown>
  );
}

const INITIAL_GREETING =
  "Hi! I'm here to help you set up your portfolio on ref. Let's start with the basics—what's your full name?";

const CONFIRM_PHRASES = [
  "is that correct",
  "does that look",
  "should i use",
  "look right",
  "look good",
  "is that right",
  "correct?",
  "looks good?",
  "sound good",
  "does that work",
  "should we go with",
];

function lastMessageAsksConfirmation(messages: { role?: string; parts: unknown[] }[]): boolean {
  if (messages.length === 0) return false;
  const last = messages[messages.length - 1];
  if (last.role !== "assistant") return false;
  const text = last.parts
    .filter((p): p is { type: "text"; text: string } => (p as { type?: string; text?: string }).type === "text" && typeof (p as { text?: string }).text === "string")
    .map((p) => p.text)
    .join(" ")
    .toLowerCase();
  return CONFIRM_PHRASES.some((phrase) => text.includes(phrase));
}

function extractPreviewData(messages: { role?: string; parts: unknown[] }[]): OnboardingData | null {
  for (const message of messages) {
    if (message.role !== "assistant") continue;
    for (const part of message.parts) {
      const p = part as { type?: string; toolName?: string; result?: { preview?: boolean; data?: OnboardingData } };
      if (p.type === "tool-invocation" && p.toolName === "request_preview" && p.result?.preview && p.result?.data) {
        return p.result.data;
      }
    }
  }
  return null;
}

function lastMessageMentionsPreview(messages: { role?: string; parts: unknown[] }[]): boolean {
  if (messages.length === 0) return false;
  const last = messages[messages.length - 1];
  if (last.role !== "assistant") return false;
  const text = last.parts
    .filter((p): p is { type: "text"; text: string } => (p as { type?: string; text?: string }).type === "text" && typeof (p as { text?: string }).text === "string")
    .map((p) => p.text)
    .join(" ")
    .toLowerCase();
  return text.includes("preview") || text.includes("confirm");
}

// Use string concat so {data.x} stays literal for react-jsx-parser bindings
const PREVIEW_JSX =
  "<Card className=\"border-primary/30 bg-primary/5\">" +
  "<CardHeader>" +
  "<CardTitle className=\"text-xl\">{data.name}</CardTitle>" +
  "<p className=\"text-muted-foreground text-sm\">{data.title}</p>" +
  "</CardHeader>" +
  "<CardContent className=\"space-y-4\">" +
  "<div>" +
  "<p className=\"text-muted-foreground text-xs font-medium uppercase tracking-wide\">Bio</p>" +
  "<p className=\"text-sm\">{data.bio}</p>" +
  "</div>" +
  "<div>" +
  "<p className=\"text-muted-foreground text-xs font-medium uppercase tracking-wide\">Services</p>" +
  "<ul className=\"mt-1 flex flex-wrap gap-2\">{servicesList}</ul>" +
  "</div>" +
  "<div>" +
  "<p className=\"text-muted-foreground text-xs font-medium uppercase tracking-wide\">Projects</p>" +
  "<div className=\"mt-2 space-y-2\">{projectList}</div>" +
  "</div>" +
  "<div className=\"flex flex-wrap items-center justify-between gap-3 pt-2\">" +
  '<p className="text-muted-foreground text-xs">ref.io/' + "{data.handle}" + " · " + "{data.tone}" + "</p>" +
  "<div className=\"flex gap-2 shrink-0\"><EditButton /><ConfirmButton /></div>" +
  "</div>" +
  "</CardContent>" +
  "</Card>";

function OnboardingPreviewCard({
  data,
  onConfirm,
  onEdit,
  isConfirming,
}: {
  data: OnboardingData;
  onConfirm: () => void;
  onEdit: () => void;
  isConfirming: boolean;
}) {
  const servicesList = (
    <>
      {data.services.map((s) => (
        <li key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm">
          {s}
        </li>
      ))}
    </>
  );
  const projectList = (
    <>
      {data.projects.map((project, i) => (
        <div key={i} className="rounded-lg border bg-background/50 p-3">
          <p className="font-medium text-sm">{project.title}</p>
          <p className="text-muted-foreground text-xs">{project.description}</p>
        </div>
      ))}
    </>
  );
  const EditButton = () => (
    <Button type="button" variant="outline" size="sm" onClick={onEdit}>
      Edit
    </Button>
  );
  const ConfirmButton = () => (
    <Button onClick={onConfirm} disabled={isConfirming} size="sm" className="shrink-0">
      {isConfirming ? "Creating…" : (
        <>
          <CheckIcon className="mr-1.5 size-4" />
          Confirm
        </>
      )}
    </Button>
  );

  return (
    <JSXPreview
      jsx={PREVIEW_JSX}
      components={{
        Card,
        CardHeader,
        CardContent,
        CardTitle,
        EditButton,
        ConfirmButton,
        editbutton: EditButton,
        confirmbutton: ConfirmButton,
      }}
      bindings={{
        data,
        servicesList,
        projectList,
      }}
      onError={(err) => console.error("JSX Preview error:", err)}
    >
      <JSXPreviewContent />
      <JSXPreviewError />
    </JSXPreview>
  );
}

const CHAT_TRANSPORT = new DefaultChatTransport({
  api: "/api/onboarding/chat",
  credentials: "include",
});

export function OnboardingChat() {
  const router = useRouter();
  const hasRedirected = useRef(false);

  const { messages, sendMessage, status, error } = useChat({
    id: "onboarding-chat",
    transport: CHAT_TRANSPORT,
    messages: [
      {
        id: crypto.randomUUID(),
        role: "assistant",
        parts: [{ type: "text" as const, text: INITIAL_GREETING }],
      },
    ],
  });

  const previewDataFromMessages = useMemo(() => extractPreviewData(messages), [messages]);
  const [previewDataFromDraft, setPreviewDataFromDraft] = useState<OnboardingData | null>(null);
  const previewData = previewDataFromMessages ?? previewDataFromDraft;
  const [isConfirming, setIsConfirming] = useState(false);
  const hasFetchedDraft = useRef(false);

  useEffect(() => {
    if (previewDataFromMessages || hasFetchedDraft.current || status === "streaming") return;
    if (!lastMessageMentionsPreview(messages)) return;

    hasFetchedDraft.current = true;
    fetch("/api/onboarding/draft", { credentials: "include" })
      .then((res) => res.json())
      .then((json: { ok?: boolean; state?: Partial<OnboardingData> } | undefined) => {
        const state = json?.state;
        if (!json?.ok || !state || typeof state !== "object") return;
        const parsed = validateFinalOnboardingState(state);
        if (parsed.ok) setPreviewDataFromDraft(parsed.value);
      })
      .catch(() => {});
  }, [messages, previewDataFromMessages, status]);

  const handleConfirm = async () => {
    if (!previewData || hasRedirected.current) return;
    setIsConfirming(true);
    try {
      const res = await fetch("/api/onboarding-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ state: previewData }),
      });
      const json = (await res.json()) as { ok?: boolean; redirectTo?: string; error?: string };
      if (json.ok && json.redirectTo) {
        hasRedirected.current = true;
        router.push(json.redirectTo);
      } else if (json.error) {
        console.error(json.error);
        setIsConfirming(false);
      }
    } catch (err) {
      console.error(err);
      setIsConfirming(false);
    }
  };

  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || status === "streaming") return;

    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      <header className="flex shrink-0 items-center justify-center border-b px-4 py-3">
        <h1 className="font-semibold text-lg">ref — Set up your portfolio</h1>
      </header>
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 text-sm">
          {error.message}
        </div>
      )}

      <div className="relative md:mx-80 flex flex-1 flex-col overflow-hidden min-h-0">
        <Conversation className="flex-1 min-h-0">
          <ConversationContent
            className={cn(
              "gap-4 p-4",
              previewData ? "pb-4" : lastMessageAsksConfirmation(messages) ? "pb-32" : "pb-24"
            )}
            scrollClassName="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12 text-muted-foreground" />}
                title="Let's get started"
                description="Type a message below to begin setting up your portfolio"
              />
            ) : (
              messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent
                    className={cn(
                      "text-base max-w-2xl break-words",
                      message.role === "assistant" && "text-primary"
                    )}
                  >
                    {(() => {
                      const textParts = message.parts.filter(
                        (part): part is { type: "text"; text: string } =>
                          part.type === "text" && typeof (part as { text?: string }).text === "string"
                      );
                      const saveStepResults = message.parts.filter((p) => {
                        const part = p as { type?: string; toolName?: string; result?: { success?: boolean } };
                        return part.type === "tool-invocation" && part.toolName === "save_step" && part.result?.success;
                      });
                      if (textParts.length > 0) {
                        return textParts.map((part, index) => (
                          <OnboardingMessageResponse key={`${message.id}-${index}`}>
                            {part.text}
                          </OnboardingMessageResponse>
                        ));
                      }
                      if (saveStepResults.length > 0) {
                        return (
                          <OnboardingMessageResponse key={`${message.id}-saved`}>
                            Saved! What would you like to add next?
                          </OnboardingMessageResponse>
                        );
                      }
                      return null;
                    })()}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {previewData && (
          <div className="shrink-0 border-t bg-background/95 backdrop-blur px-4 py-6">
            <div className="mx-auto max-w-3xl space-y-4">
              <p className="text-muted-foreground text-center text-sm">
                Review your portfolio below. Click Edit to change something, or Confirm when ready.
              </p>
              <OnboardingPreviewCard
                data={previewData}
                onConfirm={handleConfirm}
                onEdit={() => document.getElementById("onboarding-edit-input")?.focus()}
                isConfirming={isConfirming}
              />
              <form onSubmit={handleSubmit}>
                <InputGroup className="max-w-3xl">
                  <InputGroupInput
                    id="onboarding-edit-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What would you like to change? (e.g. shorten the bio, change title to Senior Developer)"
                    disabled={status === "streaming"}
                    className="text-base"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="submit"
                      variant="default"
                      size="icon-sm"
                      disabled={!input.trim() || status === "streaming"}
                    >
                      <ArrowUpIcon className="size-4" />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </form>
            </div>
          </div>
        )}

        {!previewData && (
        <div className="shrink-0 p-4 space-y-2 border-t">
          {lastMessageAsksConfirmation(messages) && status !== "streaming" && (
            <div className="mx-auto flex max-w-3xl justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => sendMessage({ text: "Yes, looks good!" })}
              >
                Yes, looks good
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => sendMessage({ text: "No, let me change that" })}
              >
                No, let me change
              </Button>
            </div>
          )}
        <form onSubmit={handleSubmit}>
          <InputGroup className="mx-auto max-w-3xl">
            <InputGroupInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={status === "streaming"}
              className="text-base md:text-base"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="submit"
                variant="default"
                size="icon-sm"
                disabled={!input.trim() || status === "streaming"}
              >
                <ArrowUpIcon className="size-4" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
        </div>
        )}
      </div>
    </div>
  );
}
