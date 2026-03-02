"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { isConversationStrategyMode } from "@/lib/agent/strategy-modes";
import { useAgentStore } from "@/lib/stores/agent-store";
import { saveAgentConfig } from "../actions";
import { useAgentActions } from "./_hooks/use-agent-actions";
import { AGENT_TABS } from "./_components/agent-config";
import { AgentStatusCards } from "./_components/agent-status-cards";
import { AgentSettingsTab } from "./_components/agent-settings-tab";
import { AgentWidgetTab } from "./_components/agent-widget-tab";
import { AgentIntegrationsTab } from "./_components/agent-integrations-tab";
import { AgentTestTab } from "./_components/agent-test-tab";

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
    notificationEmail: string | null;
    workingHours?: { dayOfWeek: number; startTime: string; endTime: string; enabled: boolean }[] | null;
    offDays?: string[] | null;
  } | null;
  agentId: string | null;
  portfolioHandle: string;
  hasContent: boolean;
  isPortfolioPublished: boolean;
}

export function AgentClient({ agent, agentId, portfolioHandle, hasContent, isPortfolioPublished }: AgentClientProps) {
  const [isPending, startTransition] = useTransition();
  const [isDisconnectingCalendar, setIsDisconnectingCalendar] = useState(false);
  const [widgetLabel, setWidgetLabel] = useState("Chat");
  const [widgetPosition, setWidgetPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");
  const [widgetWidth, setWidgetWidth] = useState(360);
  const [widgetHeight, setWidgetHeight] = useState(520);

  const { config, chatMessages, chatInput, isChatLoading, setConfig, addChatMessage, clearChatMessages, setChatInput, setIsChatLoading, resetConfig } = useAgentStore();

  useEffect(() => {
    if (!agent) return;
    resetConfig({
      isEnabled: agent.isEnabled,
      model: agent.model,
      behaviorType: agent.behaviorType || "friendly",
      strategyMode: agent.strategyMode && isConversationStrategyMode(agent.strategyMode) ? agent.strategyMode : "consultative",
      customPrompt: agent.customPrompt || "",
      temperature: agent.temperature,
      displayName: agent.displayName || "",
      avatarUrl: agent.avatarUrl || "",
      intro: agent.intro || "",
      roleLabel: agent.roleLabel || "",
      googleCalendarEnabled: agent.googleCalendarEnabled,
      googleCalendarAccountEmail: agent.googleCalendarAccountEmail,
      notificationEmail: agent.notificationEmail || null,
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
  }, [agent, resetConfig]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("calendar") === "connected") {
      toast.success("Google Calendar connected successfully");
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("calendar_error")) {
      toast.error(`Failed to connect Google Calendar: ${params.get("calendar_error")}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

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
          notificationEmail: config.notificationEmail,
          workingHours: config.workingHours,
          offDays: config.offDays,
        });
        toast.success("Agent configuration saved");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save");
      }
    });
  };

  const handleCalendarDisconnect = async () => {
    setIsDisconnectingCalendar(true);
    try {
      const resp = await fetch("/api/integrations/google-calendar/disconnect", { method: "POST" });
      if (!resp.ok) throw new Error("Failed to disconnect");
      setConfig({ googleCalendarEnabled: false, googleCalendarAccountEmail: null });
      toast.success("Google Calendar disconnected");
    } catch {
      toast.error("Failed to disconnect Google Calendar");
    } finally {
      setIsDisconnectingCalendar(false);
    }
  };

  const { sendTestMessage } = useAgentActions({ chatInput, isChatLoading, hasContent, portfolioHandle, chatMessages, addChatMessage, setChatInput, setIsChatLoading });

  const canTest = config.isEnabled && hasContent;
  const canGenerateWidget = Boolean(agentId) && Boolean(appOrigin);
  const isWidgetReady = canGenerateWidget && config.isEnabled && isPortfolioPublished;

  const scriptUrl = useMemo(() => {
    if (!canGenerateWidget || !agentId) return "";
    const url = new URL("/agent.js", appOrigin);
    url.searchParams.set("agentId", agentId);
    const trimmedLabel = widgetLabel.trim();
    if (trimmedLabel && trimmedLabel !== "Chat") url.searchParams.set("label", trimmedLabel.slice(0, 24));
    if (widgetPosition !== "bottom-right") url.searchParams.set("position", widgetPosition);
    if (widgetWidth !== 360) url.searchParams.set("w", String(widgetWidth));
    if (widgetHeight !== 520) url.searchParams.set("h", String(widgetHeight));
    return url.toString();
  }, [agentId, appOrigin, canGenerateWidget, widgetHeight, widgetLabel, widgetPosition, widgetWidth]);

  const scriptSnippet = scriptUrl ? `<script async src="${scriptUrl}"></script>` : "";
  const iframeSnippet = canGenerateWidget && agentId
    ? `<iframe src="${appOrigin}/embed/${agentId}" width="${widgetWidth}" height="${widgetHeight}" style="border:1px solid rgba(0,0,0,0.12);border-radius:12px;" loading="lazy" title="${config.displayName || "AI Assistant"}"></iframe>`
    : "";

  return (
    <div className="max-w-5xl mx-auto flex flex-col font-sans">
      <div className="flex flex-col gap-1.5 mb-6">
        <h1 className="text-3xl tracking-tight">AI Agent</h1>
        <p className="text-sm text-muted-foreground font-medium">Configure your assistant, test responses, and install the widget.</p>
      </div>

      <AgentStatusCards config={config} isPortfolioPublished={isPortfolioPublished} />

      <AnimatedTabs
        tabs={[...AGENT_TABS]}
        renderContent={(tab) => {
          if (tab.value === "settings") return <AgentSettingsTab config={config} isPending={isPending} agentId={agentId} onSave={handleSave} setConfig={setConfig} />;
          if (tab.value === "widget") return <AgentWidgetTab canGenerateWidget={canGenerateWidget} isWidgetReady={isWidgetReady} scriptUrl={scriptUrl} scriptSnippet={scriptSnippet} iframeSnippet={iframeSnippet} appOrigin={appOrigin} agentId={agentId} widgetLabel={widgetLabel} widgetPosition={widgetPosition} widgetWidth={widgetWidth} widgetHeight={widgetHeight} setWidgetLabel={setWidgetLabel} setWidgetPosition={setWidgetPosition} setWidgetWidth={setWidgetWidth} setWidgetHeight={setWidgetHeight} />;
          if (tab.value === "integrations") return <AgentIntegrationsTab config={config} isDisconnectingCalendar={isDisconnectingCalendar} handleCalendarDisconnect={handleCalendarDisconnect} />;
          if (tab.value === "test") return <AgentTestTab canTest={canTest} chatMessages={chatMessages} chatInput={chatInput} isChatLoading={isChatLoading} clearChatMessages={clearChatMessages} setChatInput={setChatInput} sendTestMessage={sendTestMessage} isAgentEnabled={config.isEnabled} />;
          return null;
        }}
      />
    </div>
  );
}
