import type { ChartConfig } from "@/components/ui/chart";
import type { Period } from "./types";

export const PERIOD_LABELS: Record<Period, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

export const PAGE_VIEWS_CHART_CONFIG = {
  pageViews: {
    label: "Page Views",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const CHAT_SESSIONS_CHART_CONFIG = {
  chatSessions: {
    label: "Chat Sessions",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const CHAT_MESSAGES_CHART_CONFIG = {
  chatMessages: {
    label: "Messages",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export const COMBINED_CHART_CONFIG = {
  pageViews: {
    label: "Page Views",
    color: "var(--chart-1)",
  },
  chatSessions: {
    label: "Chat Sessions",
    color: "var(--chart-2)",
  },
  chatMessages: {
    label: "Messages",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export const CHART_MARGIN = 35;
