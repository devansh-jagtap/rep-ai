"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type ChatMessage = { role: "user" | "assistant"; content: string };

interface EmbedChatClientProps {
  agentId: string;
}

export function EmbedChatClient({ agentId }: EmbedChatClientProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const content = input.trim();
    if (!content || loading) {
      return;
    }

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/public-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          message: content,
          history: nextMessages.slice(-8),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = (await response.json()) as { reply?: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "No response" }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Agent unavailable right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background p-3">
      <div className="mb-2 text-sm font-semibold">AI Assistant</div>
      <ScrollArea className="flex-1 rounded-md border p-3">
        <div className="space-y-2">
          {messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-3 flex gap-2">
        <Input
          value={input}
          maxLength={2000}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void send();
            }
          }}
          placeholder="Type your message..."
        />
        <Button onClick={() => void send()} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  );
}
