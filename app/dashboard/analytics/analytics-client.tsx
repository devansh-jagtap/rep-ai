"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { MessageSquare } from "lucide-react";
import {
  AnalyticsHeader,
  AnalyticsStatCards,
  ChartSkeleton,
  ClippedAreaChart,
  DailyBreakdown,
  EmptyChartState,
  EngagementOverviewChart,
  ValueLineBarChart,
} from "./components";
import { useAnalytics } from "./hooks";
import { PERIOD_LABELS } from "./constants";
import { ApiError } from "@/lib/http/fetch-json";

const GRADIENT_ID = "gradient-clipped-area-pageviews";

export function AnalyticsClient() {
  const {
    data,
    chartData,
    metrics,
    period,
    isLoading,
    isFetching,
    isError,
    error,
    setPeriodFilter,
  } = useAnalytics();

  const periodLabel = PERIOD_LABELS[period].toLowerCase();

  if (isError) {
    const status = error instanceof ApiError ? error.status : null;
    const message = error instanceof Error ? error.message : "Failed to load analytics";

    return (
      <EmptyChartState
        title={status === 401 ? "Sign in required" : "Unable to load analytics"}
        description={status === 401 ? "Your session expired. Please sign in again." : message}
        action={
          status === 401 ? (
            <Button asChild variant="outline">
              <Link href="/auth/signin">Sign in</Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 overflow-hidden">
      <AnalyticsHeader
        period={period}
        isFetching={isFetching}
        onPeriodChange={setPeriodFilter}
      />

      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <AnalyticsStatCards metrics={metrics} isLoading={isLoading} />
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        {/* Page Views Chart */}
        {isLoading ? (
          <ChartSkeleton />
        ) : chartData.length === 0 ? (
          <EmptyChartState
            title="Page Views"
            description={`Daily page views for ${periodLabel}`}
          />
        ) : (
          <ClippedAreaChart
            data={chartData}
            description={`Daily page views for ${periodLabel}`}
            badge={
              data && data.summary.totalPageViews > 0 ? (
                <Badge variant="secondary" className="ml-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    {data.summary.totalPageViews.toLocaleString()} total
                  </span>
                </Badge>
              ) : undefined
            }
            gradientId={GRADIENT_ID}
          />
        )}

        {/* Chat Sessions Chart */}
        {isLoading ? (
          <ChartSkeleton />
        ) : chartData.length === 0 ? (
          <EmptyChartState
            title="Chat Sessions"
            description="Daily chat sessions started"
          />
        ) : (
          <ValueLineBarChart
            data={chartData}
            description="Daily chat sessions started"
            badge={
              data && data.summary.totalChatSessions > 0 ? (
                <Badge variant="secondary">
                  <MessageSquare className="h-4 w-4" />
                  <span>
                    {data.summary.totalChatSessions.toLocaleString()} total
                  </span>
                </Badge>
              ) : undefined
            }
          />
        )}
      </div>

      {!isLoading && data && chartData.length > 0 && (
        <EngagementOverviewChart data={chartData} />
      )}

      <DailyBreakdown data={chartData} isLoading={isLoading} />
    </div>
  );
}
