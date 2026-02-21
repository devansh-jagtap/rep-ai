"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, MessageSquare, Users, TrendingUp } from "lucide-react";
import { useAnalyticsStore } from "@/lib/stores/analytics-store";

interface AnalyticsSummary {
  totalPageViews: number;
  totalChatSessions: number;
  totalChatMessages: number;
  uniqueVisitors: number;
}

interface DailyAnalytics {
  date: string;
  pageViews: number;
  chatSessions: number;
  chatMessages: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  daily: DailyAnalytics[];
  period: string;
}

type Period = "24h" | "7d" | "30d";

const periodLabels: Record<Period, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

function fetchAnalytics(period: Period): Promise<AnalyticsData> {
  return fetch(`/api/analytics/dashboard?period=${period}`).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function DailyBreakdownSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <div className="flex-1 grid grid-cols-3 gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsClient() {
  const { period, setPeriod } = useAnalyticsStore();
  
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["analytics", period],
    queryFn: () => fetchAnalytics(period),
    staleTime: 30 * 1000,
  });

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track how visitors interact with your portfolio and AI agent.
          </p>
        </div>
        <div className="flex gap-2">
          {(["24h", "7d", "30d"] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange(p)}
            >
              {periodLabels[p]}
              {isFetching && period === p && (
                <span className="ml-2 h-2 w-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : data ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.summary.totalPageViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Unique visitors: {data.summary.uniqueVisitors.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.summary.totalChatSessions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total messages: {data.summary.totalChatMessages.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Messages per Session</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary.totalChatSessions > 0
                    ? (data.summary.totalChatMessages / data.summary.totalChatSessions).toFixed(1)
                    : "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per visitor conversation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary.uniqueVisitors > 0
                    ? Math.round((data.summary.totalChatSessions / data.summary.uniqueVisitors) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Visitors who started a chat
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {isLoading ? (
        <DailyBreakdownSkeleton />
      ) : data ? (
        <Card>
          <CardHeader>
            <CardTitle>Daily Breakdown</CardTitle>
            <CardDescription>Your analytics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.daily.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No data available</p>
              ) : (
                data.daily.map((day: DailyAnalytics) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{day.pageViews}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{day.chatSessions}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{day.chatMessages}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
