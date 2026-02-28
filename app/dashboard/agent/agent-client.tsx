"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { Input } from "@/components/ui/input";
import { useTransition, useEffect, useMemo, useState } from "react";
import { Save, AlertCircle, ExternalLink, ArrowUpIcon, Loader2, Activity, Globe, Cpu, MessageCircle, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { saveAgentConfig } from "../actions";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
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
import { useAgentActions } from "./_hooks/use-agent-actions";
import { AnimatedTabs } from "@/components/ui/animated-tabs";

const MODELS = [
  { value: "moonshotai/Kimi-K2.5", label: "Kimi K2.5", description: "Fast & accurate" },
  { value: "MiniMaxAI/MiniMax-M2.1", label: "MiniMax M2.1", description: "Balanced" },
  { value: "zai-org/GLM-4.7-FP8", label: "GLM 4.7", description: "Multi-purpose" },
  { value: "openai/gpt-oss-120b", label: "GPT-OSS 120B", description: "Large & powerful" },
  { value: "google/gemini-3-flash", label: "Gemini 3 Flash", description: "Via Vercel AI Gateway" },
  { value: "openai/gpt-5-mini", label: "GPT-5 mini", description: "Via Vercel AI Gateway" },
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

const AGENT_TABS = [
  { label: "Settings", value: "settings" },
  { label: "Integrations", value: "integrations" },
  { label: "Widget", value: "widget" },
  { label: "Test Chat", value: "test" },
];

interface AgentClientProps {
  agent: {
    isEnabled: boolean;
    model: string;
    behaviorType: string | null;
    strategyMode: string;
    customPrompt: string | null;
    temperature: number;
    displayName: string | null;
    avatarUrl: string | null;
    intro: string | null;
    roleLabel: string | null;
    googleCalendarEnabled: boolean;
    googleCalendarAccountEmail: string | null;
    workingHours?: { dayOfWeek: number; startTime: string; endTime: string; enabled: boolean }[] | null;
    offDays?: string[] | null;
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
        displayName: agent.displayName || "",
        avatarUrl: agent.avatarUrl || "",
        intro: agent.intro || "",
        roleLabel: agent.roleLabel || "",
        googleCalendarEnabled: agent.googleCalendarEnabled,
        googleCalendarAccountEmail: agent.googleCalendarAccountEmail,
        workingHours: agent.workingHours || [
          { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", enabled: false },
          { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", enabled: true },
          { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", enabled: true },
          { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", enabled: true },
          { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", enabled: true },
          { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", enabled: true },
          { dayOfWeek: 6, startTime: "09:00", endTime: "17:00", enabled: false },
        ],
        offDays: agent.offDays || [],
      });
    }
  }, [agent, resetConfig]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("calendar") === "connected") {
      toast.success("Google Calendar connected successfully");
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("calendar_error")) {
      const error = params.get("calendar_error");
      toast.error(`Failed to connect Google Calendar: ${error}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const [widgetLabel, setWidgetLabel] = useState("Chat");
  const [widgetPosition, setWidgetPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");
  const [widgetWidth, setWidgetWidth] = useState(360);
  const [widgetHeight, setWidgetHeight] = useState(520);

  const activeModel = MODELS.find((m) => m.value === config.model);

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
          displayName: config.displayName,
          avatarUrl: config.avatarUrl,
          intro: config.intro,
          roleLabel: config.roleLabel,
          workingHours: config.workingHours,
          offDays: config.offDays,
        });
        toast.success("Agent configuration saved");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save");
      }
    });
  };

  const [isDisconnectingCalendar, setIsDisconnectingCalendar] = useState(false);
  const handleCalendarDisconnect = async () => {
    setIsDisconnectingCalendar(true);
    try {
      const resp = await fetch("/api/integrations/google-calendar/disconnect", {
        method: "POST",
      });
      if (!resp.ok) throw new Error("Failed to disconnect");
      setConfig({ googleCalendarEnabled: false, googleCalendarAccountEmail: null });
      toast.success("Google Calendar disconnected");
    } catch (error) {
      toast.error("Failed to disconnect Google Calendar");
    } finally {
      setIsDisconnectingCalendar(false);
    }
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
      ? `<iframe src="${appOrigin}/embed/${agentId}" width="${widgetWidth}" height="${widgetHeight}" style="border:1px solid rgba(0,0,0,0.12);border-radius:12px;" loading="lazy" title="${config.displayName || "AI Assistant"}"></iframe>`
      : "";

  return (
    <div className="max-w-5xl mx-auto flex flex-col font-sans">
      <div className="flex flex-col gap-1.5 mb-6">
        <h1 className="text-3xl tracking-tight">AI Agent</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Configure your assistant, test responses, and install the widget.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Status */}
        <div className="flex items-center gap-3 rounded-lg border border-border bg-transparent px-4 py-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Status</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`h-1.5 w-1.5 rounded-full ${config.isEnabled ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                {config.isEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        {/* Portfolio */}
        <div className="flex items-center gap-3 rounded-lg border border-border bg-transparent px-4 py-3">

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Portfolio</span>
              <span className="text-xs text-muted-foreground">
                {isPortfolioPublished ? "Published" : "Draft"}
              </span>
            </div>
          </div>
        </div>

        {/* Model */}
        <div className="flex items-center gap-3 rounded-lg border border-border bg-transparent px-4 py-3">

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Model</span>
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                {activeModel?.label ?? "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Mode */}
        <div className="flex items-center gap-3 rounded-lg border border-border bg-transparent px-4 py-3">

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Mode</span>
              <span className="text-xs text-muted-foreground capitalize">
                {config.strategyMode}
              </span>
            </div>
          </div>
        </div>
      </div>

      <AnimatedTabs
        tabs={AGENT_TABS}
        renderContent={(tab) => {
          if (tab.value === "settings") {
            return (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Enable AI Assistant</CardTitle>
                      <CardDescription>Responds to visitor questions and captures leads.</CardDescription>
                    </div>
                    <Switch
                      checked={config.isEnabled}
                      onCheckedChange={(checked) => setConfig({ isEnabled: checked })}
                      disabled={isPending}
                    />
                  </CardHeader>

                  <CardContent
                    className={`${config.isEnabled ? "" : "opacity-60 pointer-events-none"} transition-opacity duration-200`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-x-8 gap-y-8">
                      {/* Setting Row 1 */}
                      <div className="space-y-1">
                        <Label className="text-sm font-semibold">AI Model</Label>
                        <p className="text-xs text-muted-foreground">Select the underlying model power.</p>
                      </div>
                      <div>
                        <Select
                          value={config.model}
                          onValueChange={(value) => setConfig({ model: value })}
                          disabled={isPending}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            {MODELS.map((model) => (
                              <SelectItem key={model.value} value={model.value}>
                                <div className="flex items-center justify-between w-full pr-4 gap-4">
                                  <span className="font-medium">{model.label}</span>
                                  <span className="text-xs text-muted-foreground">{model.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Setting Row 2 */}
                      <div className="space-y-1">
                        <Label className="text-sm font-semibold">Behavior Preset</Label>
                        <p className="text-xs text-muted-foreground">How the assistant communicates.</p>
                      </div>
                      <div>
                        <Select
                          value={config.behaviorType}
                          onValueChange={(value) => setConfig({ behaviorType: value })}
                          disabled={isPending}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a preset" />
                          </SelectTrigger>
                          <SelectContent>
                            {BEHAVIOR_PRESETS.map((preset) => (
                              <SelectItem key={preset.value} value={preset.value} className="font-medium">
                                {preset.label}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom" className="font-medium">
                              Custom Instructions
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Setting Row 3 */}
                      <div className="space-y-1">
                        <Label className="text-sm font-semibold">Conversation Strategy</Label>
                        <p className="text-xs text-muted-foreground">The goal of the interactions.</p>
                      </div>
                      <div className="space-y-2">
                        <Select
                          value={config.strategyMode}
                          onValueChange={(value) => setConfig({ strategyMode: value as ConversationStrategyMode })}
                          disabled={isPending}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            {STRATEGY_MODES.map((mode) => (
                              <SelectItem key={mode.value} value={mode.value} className="font-medium">
                                {mode.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground font-medium">
                          {CONVERSATION_STRATEGY_MODES[config.strategyMode].description}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-sm font-semibold">Agent Name</Label>
                        <p className="text-xs text-muted-foreground">Shown in chat headers and intro copy.</p>
                      </div>
                      <Input
                        value={config.displayName}
                        onChange={(e) => setConfig({ displayName: e.target.value })}
                        placeholder="e.g. Alex from Acme"
                        maxLength={80}
                        disabled={isPending}
                      />

                      <div className="space-y-1">
                        <Label className="text-sm font-semibold">Role Label</Label>
                        <p className="text-xs text-muted-foreground">Optional short descriptor like Sales Advisor.</p>
                      </div>
                      <Input
                        value={config.roleLabel}
                        onChange={(e) => setConfig({ roleLabel: e.target.value })}
                        placeholder="e.g. Solutions Consultant"
                        maxLength={60}
                        disabled={isPending}
                      />

                      <div className="space-y-1">
                        <Label className="text-sm font-semibold">Avatar URL</Label>
                        <p className="text-xs text-muted-foreground">Optional image URL for embed/public chat identity.</p>
                      </div>
                      <Input
                        value={config.avatarUrl}
                        onChange={(e) => setConfig({ avatarUrl: e.target.value })}
                        placeholder="https://..."
                        disabled={isPending}
                      />

                      <div className="space-y-1">
                        <Label className="text-sm font-semibold">Intro Message</Label>
                        <p className="text-xs text-muted-foreground">Short intro shown when the chat starts.</p>
                      </div>
                      <Textarea
                        value={config.intro}
                        onChange={(e) => setConfig({ intro: e.target.value })}
                        placeholder="Hi! I'm here to help you evaluate if we're a fit."
                        maxLength={280}
                        className="min-h-[90px]"
                        disabled={isPending}
                      />

                      {/* Optional Custom Prompt */}
                      {config.behaviorType === "custom" && (
                        <>
                          <div className="space-y-1">
                            <Label className="text-sm font-semibold">Custom System Prompt</Label>
                            <p className="text-xs text-muted-foreground">Define specific boundaries.</p>
                          </div>
                          <div>
                            <Textarea
                              placeholder="Define tone, boundaries, and response style for your agent."
                              className="min-h-[120px] resize-y"
                              value={config.customPrompt}
                              onChange={(e) => setConfig({ customPrompt: e.target.value })}
                              disabled={isPending}
                            />
                          </div>
                        </>
                      )}

                      {/* Setting Row 4 */}
                      <div className="space-y-1">
                        <Label className="text-sm font-semibold">Creativity</Label>
                        <p className="text-xs text-muted-foreground">Adjust the model's randomness.</p>
                      </div>
                      <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-muted-foreground">Focused</span>
                          <span className="text-sm font-mono text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">
                            {config.temperature.toFixed(1)}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">Creative</span>
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

                  <CardFooter className="bg-muted/50 border-t border-border justify-end">
                    <Button onClick={handleSave} disabled={isPending}>
                      {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
                      {isPending ? "Saving..." : "Save Configuration"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Availability & Business Hours</CardTitle>
                    <CardDescription>Configure when the agent can schedule meetings and specific off-days.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-x-8 gap-y-8">
                      <div className="space-y-1">
                        <Label className="text-sm font-semibold">Weekly Hours</Label>
                        <p className="text-xs text-muted-foreground">Times the agent is allowed to book.</p>
                      </div>
                      <div className="space-y-3">
                        {config.workingHours.map((wh, idx) => {
                          const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                          return (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="w-24 flex items-center gap-2 shrink-0">
                                <Switch
                                  checked={wh.enabled}
                                  onCheckedChange={(checked) => {
                                    let newHours = [...config.workingHours];
                                    newHours[idx] = { ...wh, enabled: checked };
                                    setConfig({ workingHours: newHours });
                                  }}
                                  disabled={isPending}
                                />
                                <Label className="text-sm">{days[idx]}</Label>
                              </div>
                              <div className={`flex items-center gap-2 ${wh.enabled ? "" : "opacity-40 pointer-events-none"}`}>
                                <Input
                                  type="time"
                                  value={wh.startTime}
                                  onChange={(e) => {
                                    let newHours = [...config.workingHours];
                                    newHours[idx] = { ...wh, startTime: e.target.value };
                                    setConfig({ workingHours: newHours });
                                  }}
                                  disabled={isPending}
                                  className="w-32"
                                />
                                <span className="text-sm text-muted-foreground">to</span>
                                <Input
                                  type="time"
                                  value={wh.endTime}
                                  onChange={(e) => {
                                    let newHours = [...config.workingHours];
                                    newHours[idx] = { ...wh, endTime: e.target.value };
                                    setConfig({ workingHours: newHours });
                                  }}
                                  disabled={isPending}
                                  className="w-32"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-sm font-semibold">Specific Off Days</Label>
                        <p className="text-xs text-muted-foreground">Comma separated dates to block off (e.g. 2026-12-25, 2026-11-28).</p>
                      </div>
                      <div>
                        <Textarea
                          placeholder="e.g. 2026-12-25, 2026-11-28"
                          className="min-h-[80px]"
                          value={config.offDays.join(", ")}
                          onChange={(e) => {
                            const val = e.target.value;
                            const split = val.split(",").map(s => s.trim()).filter(Boolean);
                            setConfig({ offDays: split });
                          }}
                          disabled={isPending}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 border-t border-border justify-end">
                    <Button onClick={handleSave} disabled={isPending}>
                      {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
                      {isPending ? "Saving..." : "Save Configuration"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            );
          }

          if (tab.value === "widget") {
            return (
              <Card className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">Get Agent Widget</h3>
                  <p className="text-sm text-muted-foreground mt-1">Copy-paste this widget into any website and start chatting.</p>
                </div>

                {!canGenerateWidget && (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground bg-muted/50">
                    Save your configuration first so your account gets an `agentId` for the widget.
                  </div>
                )}

                {canGenerateWidget && (
                  <>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="widget-label" className="font-semibold">
                          Button Label
                        </Label>
                        <Input
                          id="widget-label"
                          value={widgetLabel}
                          maxLength={24}
                          onChange={(event) => setWidgetLabel(event.target.value)}
                          className="shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold">Position</Label>
                        <Select value={widgetPosition} onValueChange={(value) => setWidgetPosition(value as "bottom-right" | "bottom-left")}>
                          <SelectTrigger className="w-full shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bottom-right" className="font-medium">Bottom right</SelectItem>
                            <SelectItem value="bottom-left" className="font-medium">Bottom left</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="widget-width" className="font-semibold">
                          Widget Width
                        </Label>
                        <Input
                          id="widget-width"
                          type="number"
                          min={280}
                          max={480}
                          value={widgetWidth}
                          onChange={(event) =>
                            setWidgetWidth(Math.max(280, Math.min(480, Number(event.target.value) || 360)))
                          }
                          className="shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="widget-height" className="font-semibold">
                          Widget Height
                        </Label>
                        <Input
                          id="widget-height"
                          type="number"
                          min={420}
                          max={720}
                          value={widgetHeight}
                          onChange={(event) =>
                            setWidgetHeight(Math.max(420, Math.min(720, Number(event.target.value) || 520)))
                          }
                          className="shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="font-semibold">Script Install Snippet</Label>
                        <Badge variant="secondary" className="text-xs font-medium">Recommended</Badge>
                      </div>
                      <CodeBlock code={scriptSnippet} language="html" />
                    </div>

                    <div className="space-y-3">
                      <Label className="font-semibold">Iframe Fallback</Label>
                      <CodeBlock code={iframeSnippet} language="html" />
                    </div>

                    <div className="rounded-lg border bg-muted/50 p-4 text-sm space-y-2">
                      <p className="font-semibold">Install checklist</p>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground font-medium">
                        <li>Keep your portfolio published and agent enabled.</li>
                        <li>Paste the script snippet before the closing <code className="bg-muted px-1 py-0.5 rounded text-foreground">{"</body>"}</code> tag.</li>
                        <li>Open your website and click the widget button to test.</li>
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button variant="outline" size="sm" asChild className="shadow-sm font-medium">
                        <a href={scriptUrl} target="_blank" rel="noreferrer">
                          View Generated Script
                          <ExternalLink className="size-4 ml-2" />
                        </a>
                      </Button>
                      {agentId && (
                        <Button variant="outline" size="sm" asChild className="shadow-sm font-medium">
                          <a href={`${appOrigin}/embed/${agentId}`} target="_blank" rel="noreferrer">
                            Open Embed Preview
                            <ExternalLink className="size-4 ml-2" />
                          </a>
                        </Button>
                      )}
                      <div className="flex items-center">
                        <Badge variant={isWidgetReady ? "default" : "secondary"} className="font-medium">
                          {isWidgetReady ? "Widget ready to install" : "Publish + enable agent to go live"}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            );
          }

          if (tab.value === "integrations") {
            return (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                          <Calendar className="size-6" />
                        </div>
                        <Badge variant={config.googleCalendarEnabled ? "default" : "secondary"}>
                          {config.googleCalendarEnabled ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="size-3" /> Connected
                            </span>
                          ) : (
                            "Not Connected"
                          )}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">Google Calendar</CardTitle>
                      <CardDescription>
                        Allow your agent to see your availability and schedule meetings directly into your calendar.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      {config.googleCalendarEnabled && config.googleCalendarAccountEmail && (
                        <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border border-border text-sm font-medium">
                          <Globe className="size-4 text-muted-foreground" />
                          <span className="truncate">{config.googleCalendarAccountEmail}</span>
                        </div>
                      )}
                      {!config.googleCalendarEnabled && (
                        <p className="text-sm text-muted-foreground">
                          Connect your Google account to sync your calendar with your AI assistant.
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="bg-muted/30 border-t border-border mt-auto">
                      {config.googleCalendarEnabled ? (
                        <Button
                          variant="outline"
                          className="w-full text-destructive hover:text-destructive"
                          onClick={handleCalendarDisconnect}
                          disabled={isDisconnectingCalendar}
                        >
                          {isDisconnectingCalendar ? (
                            <Loader2 className="size-4 animate-spin mr-2" />
                          ) : (
                            <XCircle className="size-4 mr-2" />
                          )}
                          Disconnect Calendar
                        </Button>
                      ) : (
                        <Button className="w-full" asChild>
                          <a href="/api/integrations/google-calendar/connect">
                            Connect Google Calendar
                          </a>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </div>
              </div>
            );
          }

          if (tab.value === "test") {
            return (
              <Card className="overflow-hidden flex flex-col h=[600px]">
                <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-muted/50 shrink-0">
                  <div>
                    <h3 className="text-base font-semibold">Test Agent</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Live preview that sends real requests to your configured agent.</p>
                  </div>
                  {chatMessages.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={clearChatMessages} className="font-medium">
                      Reset
                    </Button>
                  )}
                </div>

                <Conversation className="flex-1 min-h-0 border-t-0 bg-background">
                  <ConversationContent
                    className="gap-4 p-6"
                    scrollClassName="[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 [&::-webkit-scrollbar-thumb]:rounded-full"
                  >
                    {!canTest ? (
                      <ConversationEmptyState
                        icon={<AlertCircle className="size-12 text-muted-foreground/50" />}
                        title="Agent Unavailable"
                        description={
                          !config.isEnabled
                            ? "Enable the agent to test it."
                            : "Generate your portfolio content first to test it."
                        }
                      />
                    ) : chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                        <p className="text-sm font-medium text-muted-foreground">
                          Start chatting to test your agent
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((message, index) => (
                        <Message key={index} from={message.role}>
                          <MessageContent className="text-sm max-w-[85%] break-words shadow-sm">
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
                        <MessageContent className="text-sm text-muted-foreground shadow-sm">
                          <Shimmer>•••</Shimmer>
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
                  className="shrink-0 border-t border-border p-4 bg-background"
                >
                  <InputGroup className="shadow-sm">
                    <InputGroupTextarea
                      placeholder={canTest ? "Ask something as a visitor..." : "Agent unavailable"}
                      className="min-h-[48px] max-h-32 text-sm border-0 focus-visible:ring-0"
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
            );
          }

          return null;
        }}
      />
    </div>
  );
}
