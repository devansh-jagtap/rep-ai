import { create } from "zustand";
import type { ConversationStrategyMode } from "@/lib/agent/strategy-modes";

interface AgentConfig {
  isEnabled: boolean;
  model: string;
  behaviorType: string;
  strategyMode: ConversationStrategyMode;
  customPrompt: string;
  temperature: number;
  displayName: string;
  avatarUrl: string;
  intro: string;
  roleLabel: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AgentState {
  config: AgentConfig;
  chatMessages: ChatMessage[];
  chatInput: string;
  isChatLoading: boolean;
  
  setConfig: (config: Partial<AgentConfig>) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;
  setChatInput: (input: string) => void;
  setIsChatLoading: (loading: boolean) => void;
  resetConfig: (initialConfig?: AgentConfig) => void;
}

const defaultConfig: AgentConfig = {
  isEnabled: true,
  model: "moonshotai/Kimi-K2.5",
  behaviorType: "friendly",
  strategyMode: "consultative",
  customPrompt: "",
  temperature: 0.5,
  displayName: "",
  avatarUrl: "",
  intro: "",
  roleLabel: "",
};

export const useAgentStore = create<AgentState>((set) => ({
  config: defaultConfig,
  chatMessages: [],
  chatInput: "",
  isChatLoading: false,

  setConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),

  setChatMessages: (messages) => set({ chatMessages: messages }),

  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),

  clearChatMessages: () => set({ chatMessages: [] }),

  setChatInput: (input) => set({ chatInput: input }),

  setIsChatLoading: (loading) => set({ isChatLoading: loading }),

  resetConfig: (initialConfig) =>
    set({ config: initialConfig ?? defaultConfig }),
}));
