"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useTransition, useRef, useEffect } from "react";
import { Save, BotMessageSquare, Sparkles, SendHorizontal, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { saveAgentConfig } from "../actions";
import {
  CONVERSATION_STRATEGY_MODES,
  isConversationStrategyMode,
  type ConversationStrategyMode,
} from "@/lib/agent/strategy-modes";
import { useAgentStore } from "@/lib/stores/agent-store";
import { useAgentActions } from "@/app/(dashboard)/dashboard/agent/_hooks/use-agent-actions";

const MODELS = [
  { value: "moonshotai/Kimi-K2.5", label: "Kimi K2.5", description: "Fast & accurate" },
  { value: "MiniMaxAI/MiniMax-M2.1", label: "MiniMax M2.1", description: "Balanced" },
  { value: "zai-org/GLM-4.7-FP8", label: "GLM 4.7", description: "Multi-purpose" },
  { value: "openai/gpt-oss-120b", label: "GPT-OSS 120B", description: "Large & powerful" },
] as const;

const BEHAVIOR_PRESETS = [
  { value: "friendly", label: "Friendly & Welcoming" },
  { value: "professional", label: "Strictly Professional" },
  { value: "sales", label: "Sales & Conversion Focused" },
  { value: "minimal", label: "Minimal & Direct" },
] as const;

const STRATEGY_MODES = [
  { value: "passive", label: "Passive", helper: CONVERSATION_STRATEGY_MODES.passive.description },
  { value: "consultative", label: "Consultative", helper: CONVERSATION_STRATEGY_MODES.consultative.description },
  { value: "sales", label: "Sales", helper: CONVERSATION_STRATEGY_MODES.sales.description },
] as const satisfies ReadonlyArray<{ value: ConversationStrategyMode; label: string; helper: string }>;

interface AgentClientProps {
  agent: {
    isEnabled: boolean;
    model: string;
    behaviorType: string | null;
    strategyMode: string;
    customPrompt: string | null;
    temperature: number;
  } | null;
  portfolioHandle: string;
  hasContent: boolean;
}

export function AgentClient({ agent, portfolioHandle, hasContent }: AgentClientProps) {
  const [isPending, startTransition] = useTransition();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    config,
    chatMessages,
    chatInput,
    isChatLoading,
    setConfig,
    addChatMessage,
    clearChatMessages,
    setChatInput,
    setIsChatLoading,
    resetConfig,
  } = useAgentStore();

  useEffect(() => {
    if (agent) {
      resetConfig({
        isEnabled: agent.isEnabled,
        model: agent.model,
        behaviorType: agent.behaviorType || "friendly",
        strategyMode: (agent.strategyMode && isConversationStrategyMode(agent.strategyMode)) ? agent.strategyMode : "consultative",
        customPrompt: agent.customPrompt || "",
        temperature: agent.temperature,
      });
    }
  }, [agent, resetConfig]);

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveAgentConfig({
          isEnabled: config.isEnabled,
          model: config.model,
          behaviorType: config.behaviorType === "custom" ? null : config.behaviorType,
          strategyMode: config.strategyMode,
          customPrompt: config.behaviorType === "custom" ? config.customPrompt : null,
          temperature: config.temperature,
        });
        toast.success("Agent configuration saved");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save");
      }
    });
  };

  const { sendTestMessage } = useAgentActions({
    chatInput,
    isChatLoading,
    hasContent,
    portfolioHandle,
    chatMessages,
    addChatMessage,
    setChatInput,
    setIsChatLoading,
  });

  const canTest = config.isEnabled && hasContent;

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
      <div className="flex-1 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Agent Configuration</h1>
          <p className="text-muted-foreground">
            Customize how your portfolio agent talks to visitors and captures leads.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agent Status</CardTitle>
            <CardDescription>
              Toggle the AI assistant on your public portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Label className="flex flex-col space-y-1">
              <span>Enable AI Assistant</span>
              <span className="font-normal text-sm text-muted-foreground">
                Responds to visitor inquiries and captures leads 24/7.
              </span>
            </Label>
            <Switch checked={config.isEnabled} onCheckedChange={(checked) => setConfig({ isEnabled: checked })} disabled={isPending} />
          </CardContent>
        </Card>

        <Card className={!config.isEnabled ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
          <CardHeader>
            <CardTitle>Model & Behavior</CardTitle>
            <CardDescription>
              Choose the AI model and personality for your agent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>AI Model</Label>
              <Select value={config.model} onValueChange={(value) => setConfig({ model: value })} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      <div className="flex items-center gap-2">
                        <span>{m.label}</span>
                        <span className="text-xs text-muted-foreground">— {m.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                All models run on Nebius AI Studio. Choose based on speed vs. capability.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Behavior Preset</Label>
              <Select value={config.behaviorType} onValueChange={(value) => setConfig({ behaviorType: value })} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent>
                  {BEHAVIOR_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Instructions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Conversation Strategy</Label>
              <Select value={config.strategyMode} onValueChange={(v) => setConfig({ strategyMode: v as ConversationStrategyMode })} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a strategy" />
                </SelectTrigger>
                <SelectContent>
                  {STRATEGY_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {CONVERSATION_STRATEGY_MODES[config.strategyMode].description}
              </p>
            </div>

            {config.behaviorType === "custom" && (
              <div className="space-y-3 animate-in fade-in zoom-in-95">
                <Label>Custom System Prompt</Label>
                <Textarea
                  placeholder="Define how your agent should behave, what tone to use, and any specific instructions..."
                  className="min-h-[120px]"
                  value={config.customPrompt}
                  onChange={(e) => setConfig({ customPrompt: e.target.value })}
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground">
                  This replaces the behavior preset. The agent will follow these instructions when responding.
                </p>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div className="flex justify-between">
                <Label>Creativity (Temperature)</Label>
                <span className="text-sm font-mono text-muted-foreground">{config.temperature.toFixed(1)}</span>
              </div>
              <Slider
                value={[config.temperature]}
                onValueChange={([value]) => setConfig({ temperature: value })}
                min={0.2}
                max={0.8}
                step={0.1}
                disabled={isPending}
                className="**:[[role=slider]]:h-4 **:[[role=slider]]:w-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>More focused</span>
                <span>More creative</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 py-4 justify-end border-t">
            <Button onClick={handleSave} disabled={isPending}>
              <Save className="size-4 mr-2" />
              {isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Live Test Chat */}
      <div className="w-full lg:w-[400px]">
        <Card className="flex flex-col sticky top-24 h-[600px]">
          <CardHeader className="border-b px-4 py-3 pb-4 space-y-1 bg-muted/50 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary text-primary-foreground">
                <BotMessageSquare className="size-4" />
              </div>
              <CardTitle className="text-base">Test Agent</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Live preview — sends real requests to your configured agent
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {!canTest && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-2 p-4">
                  <AlertCircle className="size-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    {!config.isEnabled
                      ? "Enable the agent to test it."
                      : "Generate your portfolio content first to test the agent."
                    }
                  </p>
                </div>
              </div>
            )}

            {canTest && chatMessages.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-2 p-4">
                  <Sparkles className="size-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Send a message to test your agent as a visitor would see it.
                  </p>
                </div>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-3 rounded-2xl text-sm max-w-[85%] whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-2xl rounded-tl-sm text-sm flex gap-2 items-center">
                  <Sparkles className="size-4 text-primary animate-pulse" />
                  <span className="text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </CardContent>

          <div className="p-4 border-t bg-background shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); sendTestMessage(); }}
              className="relative"
            >
              <Textarea
                placeholder={canTest ? "Ask something as a visitor..." : "Agent unavailable"}
                className="min-h-[60px] resize-none pr-12"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={!canTest || isChatLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendTestMessage();
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8 rounded-md"
                disabled={!canTest || !chatInput.trim() || isChatLoading}
              >
                <SendHorizontal className="size-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
