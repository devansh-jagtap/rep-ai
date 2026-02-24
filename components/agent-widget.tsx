"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare, X, ArrowUpIcon, Loader2 } from "lucide-react";
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
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { MessageResponse } from "@/components/ai-elements/message";
import { widgetChatWithAgent } from "@/app/[handle]/actions";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface AgentWidgetProps {
  handle: string;
  agentName?: string;
}

export function AgentWidget({ handle, agentName = "AI Assistant" }: AgentWidgetProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  const history = useMemo(() => messages.slice(-10), [messages]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };
    
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setStreamingContent("");

    try {
      const result = await widgetChatWithAgent({
        handle,
        message,
        history,
      });

      const reply = result.ok
        ? result.reply
        : result.error ?? "Request failed.";

      let streamed = "";
      for (const char of reply) {
        streamed += char;
        setStreamingContent(streamed);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: streamed },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { 
          id: crypto.randomUUID(), 
          role: "assistant", 
          content: "Something went wrong. Please try again." 
        },
      ]);
    } finally {
      setLoading(false);
      setStreamingContent("");
    }
  }, [input, loading, messages, handle, history]);

  const allMessages = useMemo(() => {
    if (!streamingContent) return messages;
    return [
      ...messages,
      { id: "streaming", role: "assistant" as const, content: streamingContent },
    ];
  }, [messages, streamingContent]);

  return (
    <div className="fixed right-6 bottom-6 z-50">
      {!open ? (
        <Button
          onClick={() => setOpen(true)}
          className="rounded-full shadow-lg gap-2"
          size="lg"
        >
          <MessageSquare className="size-5" />
          <span className="hidden sm:inline">Chat</span>
        </Button>
      ) : (
        <div className="bg-background flex h-[520px] w-[380px] max-w-[calc(100vw-48px)] flex-col rounded-2xl border shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <p className="font-medium text-sm">{agentName}</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </Button>
          </div>

          <Conversation className="flex-1 min-h-0">
            <ConversationContent
              className="gap-3 p-4"
              scrollClassName="[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50"
            >
              {allMessages.length === 0 ? (
                <ConversationEmptyState
                  icon={<MessageSquare className="size-10 text-muted-foreground" />}
                  title="Start a conversation"
                  description="Ask me anything about this portfolio"
                />
              ) : (
                allMessages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    <MessageContent
                      className={cn(
                        "text-sm max-w-[85%] break-words",
                        message.role === "assistant" && "text-foreground"
                      )}
                    >
                      {message.role === "assistant" ? (
                        <MessageResponse>{message.content}</MessageResponse>
                      ) : (
                        <span>{message.content}</span>
                      )}
                    </MessageContent>
                  </Message>
                ))
              )}
              {loading && !streamingContent && (
                <Message from="assistant">
                  <MessageContent className="text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="size-3 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <form onSubmit={handleSubmit} className="shrink-0 border-t p-3">
            <InputGroup>
              <InputGroupTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !loading) {
                      handleSubmit(e);
                    }
                  }
                }}
                placeholder="Type your message..."
                disabled={loading}
                className="min-h-[44px] max-h-32 text-sm"
                rows={1}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="submit"
                  variant="default"
                  size="icon-sm"
                  disabled={!input.trim() || loading}
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowUpIcon className="size-4" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </div>
      )}
    </div>
  );
}
