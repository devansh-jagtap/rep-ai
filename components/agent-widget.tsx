"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

interface AgentWidgetProps {
  handle: string;
}

export function AgentWidget({ handle }: AgentWidgetProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const history = useMemo(() => messages.slice(-10), [messages]);

  async function send() {
    const message = input.trim();
    if (!message || loading) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: message }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const response = await fetch("/api/public-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, message, history }),
    });

    const data = (await response.json().catch(() => null)) as { reply?: string; error?: string } | null;
    const reply = response.ok ? data?.reply ?? "Sorry, I couldn't generate a reply." : data?.error ?? "Request failed.";

    let streamed = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    for (const char of reply) {
      streamed += char;
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.role === "assistant") {
          copy[copy.length - 1] = { ...last, content: streamed };
        }
        return copy;
      });
      await new Promise((resolve) => setTimeout(resolve, 8));
    }

    setLoading(false);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 0);
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      {!open ? (
        <Button onClick={() => setOpen(true)} className="rounded-full">Chat</Button>
      ) : (
        <div className="bg-background w-[360px] rounded-lg border shadow-xl">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <p className="font-medium text-sm">AI Assistant</p>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Close</Button>
          </div>
          <div ref={scrollRef} className="max-h-[360px] space-y-3 overflow-y-auto p-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={message.role === "user" ? "text-right" : "text-left"}
              >
                <div className="bg-muted inline-block rounded-md px-3 py-2 text-sm">{message.content}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void send();
                }
              }}
            />
            <Button onClick={() => void send()} disabled={loading}>Send</Button>
          </div>
        </div>
      )}
    </div>
  );
}
