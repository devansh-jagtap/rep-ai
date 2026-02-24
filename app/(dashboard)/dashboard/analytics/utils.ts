import type { AnalyticsData, DailyAnalytics, Period } from "./types";

export async function fetchAnalytics(period: Period): Promise<AnalyticsData> {
  const res = await fetch(`/api/analytics/dashboard?period=${period}`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export function fillDateGaps(
  daily: DailyAnalytics[],
  period: Period
): DailyAnalytics[] {
  const days = period === "24h" ? 2 : period === "7d" ? 7 : 30;
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  const dataMap = new Map(daily.map((d) => [d.date, d]));
  const result: DailyAnalytics[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    result.push(
      dataMap.get(dateStr) ?? {
        date: dateStr,
        pageViews: 0,
        chatSessions: 0,
        chatMessages: 0,
      }
    );
  }

  return result;
}

export function formatChartDate(dateStr: string, period: Period): string {
  const d = new Date(dateStr);
  if (period === "24h") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (period === "7d") {
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
