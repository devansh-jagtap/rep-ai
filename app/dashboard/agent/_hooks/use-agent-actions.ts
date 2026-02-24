import { useCallback } from "react";
import { toast } from "sonner";

export function useAgentActions(params: {
  chatInput: string;
  isChatLoading: boolean;
  hasContent: boolean;
  portfolioHandle: string;
  chatMessages: { role: "user" | "assistant"; content: string }[];
  addChatMessage: (msg: { role: "user" | "assistant"; content: string }) => void;
  setChatInput: (input: string) => void;
  setIsChatLoading: (loading: boolean) => void;
}) {
  const sendTestMessage = useCallback(async () => {
    const msg = params.chatInput.trim();
    if (!msg || params.isChatLoading) return;

    if (!params.hasContent) {
      toast.error("Generate your portfolio content first before testing the agent.");
      return;
    }

    params.addChatMessage({ role: "user", content: msg });
    params.setChatInput("");
    params.setIsChatLoading(true);

    try {
      const res = await fetch("/api/public-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: params.portfolioHandle,
          message: msg,
          history: params.chatMessages.slice(-10),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      params.addChatMessage({ role: "assistant", content: data.reply });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Agent unavailable";
      params.addChatMessage({ role: "assistant", content: `Error: ${errorMsg}` });
    } finally {
      params.setIsChatLoading(false);
    }
  }, [params]);

  return { sendTestMessage };
}
