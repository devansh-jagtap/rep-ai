import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { chatWithAgent } from "../../actions";

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
  const sessionIdRef = useRef<string | null>(null);

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
      const result = await chatWithAgent({
        handle: params.portfolioHandle,
        message: msg,
        history: params.chatMessages.slice(-10),
        sessionId: sessionIdRef.current,
      });

      if (result.ok && result.sessionId) {
        sessionIdRef.current = result.sessionId;
      }

      if (!result.ok) {
        throw new Error(result.error);
      }

      const finalReply = result.reply?.trim()
        ? result.reply
        : "I'm having trouble responding right now. Could you try asking in a different way?";

      params.addChatMessage({ role: "assistant", content: finalReply });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Agent unavailable";
      params.addChatMessage({ role: "assistant", content: `Error: ${errorMsg}` });
    } finally {
      params.setIsChatLoading(false);
    }
  }, [params]);

  return { sendTestMessage };
}
