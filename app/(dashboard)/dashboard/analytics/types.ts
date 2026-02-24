export interface AnalyticsSummary {
  totalPageViews: number;
  totalChatSessions: number;
  totalChatMessages: number;
  uniqueVisitors: number;
}

export interface DailyAnalytics {
  date: string;
  pageViews: number;
  chatSessions: number;
  chatMessages: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  daily: DailyAnalytics[];
  period: string;
}

export type Period = "24h" | "7d" | "30d";

export interface ChartDataPoint extends DailyAnalytics {
  label: string;
}
