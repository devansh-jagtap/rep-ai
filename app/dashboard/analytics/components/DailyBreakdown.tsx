"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, MessageSquare, Users } from "lucide-react";
import type { ChartDataPoint } from "../types";

interface DailyBreakdownProps {
  data: ChartDataPoint[] | undefined;
  isLoading: boolean;
}

export function DailyBreakdown({ data, isLoading }: DailyBreakdownProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <div className="grid flex-1 grid-cols-3 gap-4">
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Breakdown</CardTitle>
        <CardDescription>Your analytics over time</CardDescription>
      </CardHeader>
      <CardContent>
        {!data?.length ? (
          <p className="py-8 text-center text-muted-foreground">
            No data available for this period
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[280px] space-y-4">
              {data.map((day) => (
                <div
                  key={day.date}
                  className="flex flex-col gap-2 border-b border-border/50 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="w-full shrink-0 text-sm font-medium text-muted-foreground sm:w-28">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="grid flex-1 grid-cols-3 gap-4 sm:gap-6">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {day.pageViews}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        views
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {day.chatSessions}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        sessions
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {day.chatMessages}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        messages
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
