"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { COMBINED_CHART_CONFIG } from "../constants";
import type { ChartDataPoint } from "../types";

interface EngagementOverviewChartProps {
  data: ChartDataPoint[];
}

export function EngagementOverviewChart({ data }: EngagementOverviewChartProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Engagement Overview</CardTitle>
        <CardDescription>
          Page views, chat sessions, and messages over time
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer
          config={COMBINED_CHART_CONFIG}
          className="min-h-[220px] w-full min-w-0"
        >
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 0, right: 0 }}
          >
            <defs>
              <linearGradient
                id="fillPageViewsCombined"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-pageViews)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-pageViews)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="fillChatSessionsCombined"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-chatSessions)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-chatSessions)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="fillChatMessagesCombined"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-chatMessages)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-chatMessages)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-muted"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis hide />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.date
                      ? new Date(
                          payload[0].payload.date
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : ""
                  }
                />
              }
            />
            <Area
              dataKey="pageViews"
              type="monotone"
              fill="url(#fillPageViewsCombined)"
              stroke="var(--color-pageViews)"
              strokeWidth={2}
            />
            <Area
              dataKey="chatSessions"
              type="monotone"
              fill="url(#fillChatSessionsCombined)"
              stroke="var(--color-chatSessions)"
              strokeWidth={2}
            />
            <Area
              dataKey="chatMessages"
              type="monotone"
              fill="url(#fillChatMessagesCombined)"
              stroke="var(--color-chatMessages)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
