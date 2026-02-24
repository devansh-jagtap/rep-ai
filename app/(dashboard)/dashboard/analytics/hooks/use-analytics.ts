"use client";

import { useMemo } from "react";
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

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!data?.daily?.length) return [];
    const filled = fillDateGaps(data.daily, period);
    return filled.map((d) => ({
      ...d,
      label: formatChartDate(d.date, period),
    }));
  }, [data?.daily, period]);

  const metrics = useMemo(() => {
    if (!data) return null;
    const { summary } = data;
    const avgMessagesPerSession =
      summary.totalChatSessions > 0
        ? (
            summary.totalChatMessages / summary.totalChatSessions
          ).toFixed(1)
        : "0";
    const engagementRate =
      summary.uniqueVisitors > 0
        ? Math.round(
            (summary.totalChatSessions / summary.uniqueVisitors) * 100
          )
        : 0;

    return {
      ...summary,
      avgMessagesPerSession,
      engagementRate,
    };
  }, [data]);

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
