"use client";

import { useQuery } from "@tanstack/react-query";
import { useAnalyticsStore } from "@/lib/stores/analytics-store";
import { fetchAnalytics, fillDateGaps, formatChartDate } from "../utils";
import type { ChartDataPoint, Period } from "../types";

export function useAnalytics() {
  const { period, setPeriod } = useAnalyticsStore();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["analytics", period],
    queryFn: () => fetchAnalytics(period),
    staleTime: 30 * 1000,
  });

  const chartData: ChartDataPoint[] = !data?.daily?.length
    ? []
    : fillDateGaps(data.daily, period).map((d) => ({
        ...d,
        label: formatChartDate(d.date, period),
      }));

  const metrics = !data
    ? null
    : {
        ...data.summary,
        avgMessagesPerSession:
          data.summary.totalChatSessions > 0
            ? (data.summary.totalChatMessages / data.summary.totalChatSessions).toFixed(1)
            : "0",
        engagementRate:
          data.summary.uniqueVisitors > 0
            ? Math.round((data.summary.totalChatSessions / data.summary.uniqueVisitors) * 100)
            : 0,
      };

  const setPeriodFilter = (newPeriod: Period) => setPeriod(newPeriod);

  return {
    data,
    chartData,
    metrics,
    period,
    isLoading,
    isFetching,
    setPeriodFilter,
  };
}
