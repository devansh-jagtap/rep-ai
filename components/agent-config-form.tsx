"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { SUPPORTED_AGENT_MODELS } from "@/lib/agent/models";
import { BEHAVIOR_PRESETS } from "@/lib/agent/behavior-presets";
import { CONVERSATION_STRATEGY_MODES, type ConversationStrategyMode } from "@/lib/agent/strategy-modes";

interface GoogleCalendarConfig {
  googleCalendarEnabled: boolean;
  googleCalendarAccountEmail: string | null;
}

interface AgentConfigFormProps {
  initialConfig: {
    isEnabled: boolean;
    model: string;
    behaviorType: string;
    strategyMode: ConversationStrategyMode;
    customPrompt: string;
    temperature: number;
  };
  googleCalendarConfig: GoogleCalendarConfig;
}

export function AgentConfigForm({ initialConfig, googleCalendarConfig }: AgentConfigFormProps) {
  const [isEnabled, setIsEnabled] = useState(initialConfig.isEnabled);
  const [model, setModel] = useState(initialConfig.model);
  const [behaviorType, setBehaviorType] = useState(initialConfig.behaviorType);
  const [strategyMode, setStrategyMode] = useState<ConversationStrategyMode>(initialConfig.strategyMode);
  const [customPrompt, setCustomPrompt] = useState(initialConfig.customPrompt);
  const [temperature, setTemperature] = useState(initialConfig.temperature);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [calendarStatus, setCalendarStatus] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  async function onSave() {
    setIsSaving(true);
    setStatus(null);

    const response = await fetch("/api/agent/configure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isEnabled,
        model,
        behaviorType,
        strategyMode,
        customPrompt,
        temperature,
      }),
    });

    const data = (await response.json().catch(() => null)) as { error?: string } | null;

    setIsSaving(false);
    if (!response.ok) {
      setStatus(data?.error ?? "Failed to save agent config");
      return;
    }

    setStatus("Saved.");
  }

  const tabs = [
    {
      label: "General",
      value: "general",
      content: (
        <div className="space-y-5 p-1 pt-5">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <input
              id="agent-enabled"
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="h-4 w-4"
            />
            <div>
              <Label htmlFor="agent-enabled" className="cursor-pointer">Enable AI Agent</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Make your AI agent available on your public portfolio</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-model">Model</Label>
            <select
              id="agent-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
            >
              {SUPPORTED_AGENT_MODELS.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>
        </div>
      ),
    },
    {
      label: "Behavior",
      value: "behavior",
      content: (
        <div className="space-y-5 p-1 pt-5">
          <div className="space-y-2">
            <Label htmlFor="behavior">Behavior preset</Label>
            <select
              id="behavior"
              value={behaviorType}
              onChange={(e) => setBehaviorType(e.target.value)}
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
            >
              {Object.keys(BEHAVIOR_PRESETS).map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="strategy-mode">Conversation strategy</Label>
            <select
              id="strategy-mode"
              value={strategyMode}
              onChange={(e) => setStrategyMode(e.target.value as ConversationStrategyMode)}
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
            >
              {Object.entries(CONVERSATION_STRATEGY_MODES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {CONVERSATION_STRATEGY_MODES[strategyMode].description}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-prompt">Custom prompt <span className="text-muted-foreground font-normal">(optional, overrides preset)</span></Label>
            <Textarea
              id="custom-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add custom behavior instructions"
              className="min-h-[120px]"
            />
          </div>
        </div>
      ),
    },
    {
      label: "Integrations",
      value: "integrations",
      content: (
        <div className="space-y-5 p-1 pt-5">
          <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label>Google Calendar</Label>
                <p className="text-xs text-muted-foreground">
                  Allow your agent to check availability and schedule meetings
                </p>
              </div>
              {googleCalendarConfig.googleCalendarEnabled ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-green-600 font-medium">
                    ✓ {googleCalendarConfig.googleCalendarAccountEmail}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setCalendarStatus(null);
                      try {
                        const res = await fetch("/api/integrations/google-calendar/disconnect", {
                          method: "POST",
                        });
                        if (res.ok) {
                          setCalendarStatus("disconnected");
                          window.location.reload();
                        } else {
                          setCalendarStatus("Failed to disconnect");
                        }
                      } catch {
                        setCalendarStatus("Failed to disconnect");
                      }
                    }}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    setIsConnecting(true);
                    window.location.href = "/api/integrations/google-calendar/connect";
                  }}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : "Connect"}
                </Button>
              )}
            </div>
            {calendarStatus && <p className="text-sm mt-3">{calendarStatus}</p>}
          </div>
        </div>
      ),
    },
    {
      label: "Advanced",
      value: "advanced",
      content: (
        <div className="space-y-5 p-1 pt-5">
          <div className="space-y-2">
            <Label htmlFor="temperature">
              Temperature: <span className="font-mono">{temperature.toFixed(2)}</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Lower values make responses more focused and deterministic; higher values make them more creative.
            </p>
            <Input
              id="temperature"
              type="range"
              min={0.2}
              max={0.8}
              step={0.05}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Precise (0.2)</span>
              <span>Creative (0.8)</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-8 rounded-lg border p-6">
      <AnimatedTabs tabs={tabs} />
      <div className="mt-6 flex items-center gap-3 border-t pt-4">
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        {status && (
          <p className={`text-sm ${status === "Saved." ? "text-green-600" : "text-destructive"}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
