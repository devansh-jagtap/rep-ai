"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SUPPORTED_AGENT_MODELS } from "@/lib/agent/models";
import { BEHAVIOR_PRESETS } from "@/lib/agent/behavior-presets";
import { CONVERSATION_STRATEGY_MODES, type ConversationStrategyMode } from "@/lib/agent/strategy-modes";

interface AgentConfigFormProps {
  initialConfig: {
    isEnabled: boolean;
    model: string;
    behaviorType: string;
    strategyMode: ConversationStrategyMode;
    customPrompt: string;
    temperature: number;
  };
}

export function AgentConfigForm({ initialConfig }: AgentConfigFormProps) {
  const [isEnabled, setIsEnabled] = useState(initialConfig.isEnabled);
  const [model, setModel] = useState(initialConfig.model);
  const [behaviorType, setBehaviorType] = useState(initialConfig.behaviorType);
  const [strategyMode, setStrategyMode] = useState<ConversationStrategyMode>(initialConfig.strategyMode);
  const [customPrompt, setCustomPrompt] = useState(initialConfig.customPrompt);
  const [temperature, setTemperature] = useState(initialConfig.temperature);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <div className="mt-8 space-y-5 rounded-lg border p-6">
      <div className="flex items-center gap-2">
        <input id="agent-enabled" type="checkbox" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} />
        <Label htmlFor="agent-enabled">Enable AI Agent</Label>
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
        <Label htmlFor="custom-prompt">Custom prompt (optional, overrides preset)</Label>
        <Textarea
          id="custom-prompt"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Add custom behavior instructions"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="temperature">Temperature: {temperature.toFixed(2)}</Label>
        <Input
          id="temperature"
          type="range"
          min={0.2}
          max={0.8}
          step={0.05}
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
        />
      </div>

      <Button onClick={onSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
      {status ? <p className="text-sm">{status}</p> : null}
    </div>
  );
}
