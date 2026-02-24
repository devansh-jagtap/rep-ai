"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTransition, useEffect, useMemo, useState } from "react";
import { Save, BotMessageSquare, AlertCircle, Copy, ExternalLink, ArrowUpIcon, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { saveAgentConfig } from "../actions";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
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
  agentId: string | null;
  portfolioHandle: string;
  hasContent: boolean;
  isPortfolioPublished: boolean;
}

export function AgentClient({
  agent,
  agentId,
  portfolioHandle,
  hasContent,
  isPortfolioPublished,
}: AgentClientProps) {
  const [isPending, startTransition] = useTransition();

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

  const [widgetLabel, setWidgetLabel] = useState("Chat");
  const [widgetPosition, setWidgetPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");
  const [widgetWidth, setWidgetWidth] = useState(360);
  const [widgetHeight, setWidgetHeight] = useState(520);

  const appOrigin = useMemo(() => {
    const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (configuredOrigin) return configuredOrigin.replace(/\/$/, "");
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  }, []);

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
  const canGenerateWidget = Boolean(agentId) && Boolean(appOrigin);
  const isWidgetReady = canGenerateWidget && config.isEnabled && isPortfolioPublished;
  const scriptUrl = useMemo(() => {
    if (!canGenerateWidget || !agentId) return "";
    const url = new URL("/agent.js", appOrigin);
    url.searchParams.set("agentId", agentId);

    const trimmedLabel = widgetLabel.trim();
    if (trimmedLabel && trimmedLabel !== "Chat") {
      url.searchParams.set("label", trimmedLabel.slice(0, 24));
    }
    if (widgetPosition !== "bottom-right") {
      url.searchParams.set("position", widgetPosition);
    }
    if (widgetWidth !== 360) {
      url.searchParams.set("w", String(widgetWidth));
    }
    if (widgetHeight !== 520) {
      url.searchParams.set("h", String(widgetHeight));
    }
    return url.toString();
  }, [agentId, appOrigin, canGenerateWidget, widgetHeight, widgetLabel, widgetPosition, widgetWidth]);

  const scriptSnippet = scriptUrl ? `<script async src="${scriptUrl}"></script>` : "";
  const iframeSnippet =
    canGenerateWidget && agentId
      ? `<iframe src="${appOrigin}/embed/${agentId}" width="${widgetWidth}" height="${widgetHeight}" style="border:1px solid rgba(0,0,0,0.12);border-radius:12px;" loading="lazy" title="AI Assistant"></iframe>`
      : "";

  const copyToClipboard = async (value: string, label: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Agent</h1>
        <p className="text-muted-foreground">
          Configure your assistant, test responses, and install the widget on your own site.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-base">
              {config.isEnabled ? (
                <Badge className="bg-blue-500 text-white hover:bg-blue-500">Enabled</Badge>
              ) : (
                <Badge variant="outline">Disabled</Badge>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Portfolio</CardDescription>
            <CardTitle className="text-base">
              {isPortfolioPublished ? (
                <Badge className="bg-green-600 text-white hover:bg-green-600">Published</Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Model</CardDescription>
            <CardTitle className="text-base">
              {MODELS.find((model) => model.value === config.model)?.label ?? "Unknown"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversation Mode</CardDescription>
            <CardTitle className="text-base capitalize">{config.strategyMode}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Settings</CardTitle>
              <CardDescription>Choose how your agent behaves and responds to visitors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <Label className="flex flex-col space-y-1">
                  <span>Enable AI Assistant</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Responds to visitor questions and captures leads.
                  </span>
                </Label>
                <Switch
                  checked={config.isEnabled}
                  onCheckedChange={(checked) => setConfig({ isEnabled: checked })}
                  disabled={isPending}
                />
              </div>

              <div className={config.isEnabled ? "space-y-6" : "space-y-6 opacity-60"}>
                <div className="space-y-3">
                  <Label>AI Model</Label>
                  <Select value={config.model} onValueChange={(value) => setConfig({ model: value })} disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          <div className="flex items-center gap-2">
                            <span>{model.label}</span>
                            <span className="text-xs text-muted-foreground">— {model.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Behavior Preset</Label>
                  <Select value={config.behaviorType} onValueChange={(value) => setConfig({ behaviorType: value })} disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a preset" />
                    </SelectTrigger>
                    <SelectContent>
                      {BEHAVIOR_PRESETS.map((preset) => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Instructions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Conversation Strategy</Label>
                  <Select
                    value={config.strategyMode}
                    onValueChange={(value) => setConfig({ strategyMode: value as ConversationStrategyMode })}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {STRATEGY_MODES.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {CONVERSATION_STRATEGY_MODES[config.strategyMode].description}
                  </p>
                </div>

                {config.behaviorType === "custom" && (
                  <div className="space-y-3">
                    <Label>Custom System Prompt</Label>
                    <Textarea
                      placeholder="Define tone, boundaries, and response style for your agent."
                      className="min-h-[120px]"
                      value={config.customPrompt}
                      onChange={(e) => setConfig({ customPrompt: e.target.value })}
                      disabled={isPending}
                    />
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
                  />
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

          <Card>
            <CardHeader>
              <CardTitle>Get Agent Widget</CardTitle>
              <CardDescription>Copy-paste this widget into any website and start chatting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!canGenerateWidget && (
                <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                  Save your configuration first so your account gets an `agentId` for the widget.
                </div>
              )}

              {canGenerateWidget && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="widget-label">Button Label</Label>
                      <input
                        id="widget-label"
                        value={widgetLabel}
                        maxLength={24}
                        onChange={(event) => setWidgetLabel(event.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Select value={widgetPosition} onValueChange={(value) => setWidgetPosition(value as "bottom-right" | "bottom-left")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-right">Bottom right</SelectItem>
                          <SelectItem value="bottom-left">Bottom left</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="widget-width">Widget Width</Label>
                      <input
                        id="widget-width"
                        type="number"
                        min={280}
                        max={480}
                        value={widgetWidth}
                        onChange={(event) => setWidgetWidth(Math.max(280, Math.min(480, Number(event.target.value) || 360)))}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="widget-height">Widget Height</Label>
                      <input
                        id="widget-height"
                        type="number"
                        min={420}
                        max={720}
                        value={widgetHeight}
                        onChange={(event) => setWidgetHeight(Math.max(420, Math.min(720, Number(event.target.value) || 520)))}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Script Install Snippet</Label>
                      <Button variant="secondary" size="sm" onClick={() => copyToClipboard(scriptSnippet, "Script snippet")}>
                        <Copy className="size-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <pre className="rounded-md border bg-muted/40 p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                      {scriptSnippet}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Iframe Fallback</Label>
                      <Button variant="secondary" size="sm" onClick={() => copyToClipboard(iframeSnippet, "Iframe snippet")}>
                        <Copy className="size-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <pre className="rounded-md border bg-muted/40 p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                      {iframeSnippet}
                    </pre>
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
                    <p className="font-medium">Install checklist</p>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>Keep your portfolio published and agent enabled.</li>
                      <li>Paste the script snippet before the closing {"</body>"} tag.</li>
                      <li>Open your website and click the widget button to test.</li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={scriptUrl} target="_blank" rel="noreferrer">
                        View Generated Script
                        <ExternalLink className="size-4 ml-2" />
                      </a>
                    </Button>
                    {agentId && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`${appOrigin}/embed/${agentId}`} target="_blank" rel="noreferrer">
                          Open Embed Preview
                          <ExternalLink className="size-4 ml-2" />
                        </a>
                      </Button>
                    )}
                    <Badge variant={isWidgetReady ? "default" : "secondary"}>
                      {isWidgetReady ? "Widget ready to install" : "Publish + enable agent to go live"}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-[400px]">
          <Card className="flex flex-col sticky top-24 h-[600px]">
            <CardHeader className="border-b px-4 py-3 pb-4 space-y-1 bg-muted/50 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary text-primary-foreground">
                    <BotMessageSquare className="size-4" />
                  </div>
                  <CardTitle className="text-base">Test Agent</CardTitle>
                </div>
                {chatMessages.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={clearChatMessages}>
                    Reset
                  </Button>
                )}
              </div>
              <CardDescription className="text-xs">
                Live preview that sends real requests to your configured agent.
              </CardDescription>
            </CardHeader>

            <Conversation className="flex-1 min-h-0 border-t-0 bg-background/50">
              <ConversationContent
                className="gap-4 p-4"
                scrollClassName="[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full"
              >
                {!canTest ? (
                  <ConversationEmptyState
                    icon={<AlertCircle className="size-12 text-muted-foreground" />}
                    title="Agent Unavailable"
                    description={
                      !config.isEnabled
                        ? "Enable the agent to test it."
                        : "Generate your portfolio content first to test it."
                    }
                  />
                ) : chatMessages.length === 0 ? (
                  <ConversationEmptyState
                    icon={<MessageSquare className="size-12 text-muted-foreground" />}
                    title="Test your Agent"
                    description="Send a message to test your visitor experience."
                  />
                ) : (
                  chatMessages.map((message, index) => (
                    <Message key={index} from={message.role}>
                      <MessageContent className="text-sm max-w-[85%] break-words">
                        {message.role === "assistant" ? (
                          <MessageResponse>{message.content}</MessageResponse>
                        ) : (
                          <span>{message.content}</span>
                        )}
                      </MessageContent>
                    </Message>
                  ))
                )}
                {isChatLoading && (
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

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendTestMessage();
              }}
              className="shrink-0 border-t p-4 bg-background"
            >
              <InputGroup>
                <InputGroupTextarea
                  placeholder={canTest ? "Ask something as a visitor..." : "Agent unavailable"}
                  className="min-h-[48px] max-h-32 text-sm"
                  rows={1}
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  disabled={!canTest || isChatLoading}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      if (canTest && chatInput.trim() && !isChatLoading) {
                        sendTestMessage();
                      }
                    }
                  }}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="submit"
                    variant="default"
                    size="icon-sm"
                    disabled={!canTest || !chatInput.trim() || isChatLoading}
                  >
                    {isChatLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArrowUpIcon className="size-4" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
