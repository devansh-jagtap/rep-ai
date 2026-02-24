"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, MessageSquare, Users, TrendingUp } from "lucide-react";
import { StatCardSkeleton } from "./StatCardSkeleton";

interface Metrics {
  totalPageViews: number;
  totalChatSessions: number;
  totalChatMessages: number;
  uniqueVisitors: number;
  avgMessagesPerSession: string;
  engagementRate: number;
}

interface AnalyticsStatCardsProps {
  metrics: Metrics | null;
  isLoading: boolean;
}

export function AnalyticsStatCards({ metrics, isLoading }: AnalyticsStatCardsProps) {
  if (isLoading) {
    return (
      <>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </>
    );
  }

  if (!metrics) return null;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Page Views
          </CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.totalPageViews.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Unique visitors: {metrics.uniqueVisitors.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Chat Sessions
          </CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.totalChatSessions.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Total messages: {metrics.totalChatMessages.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg. Messages per Session
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.avgMessagesPerSession}
          </div>
          <p className="text-xs text-muted-foreground">
            Per visitor conversation
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Engagement Rate
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.engagementRate}%</div>
          <p className="text-xs text-muted-foreground">
            Visitors who started a chat
          </p>
        </CardContent>
      </Card>
    </>
  );
}
