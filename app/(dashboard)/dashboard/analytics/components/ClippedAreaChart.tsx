"use client";

import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { useSpring, useMotionValueEvent } from "motion/react";
import { PAGE_VIEWS_CHART_CONFIG } from "../constants";
import type { ChartDataPoint } from "../types";

interface ClippedAreaChartProps {
  data: ChartDataPoint[];
  description: string;
  badge?: React.ReactNode;
  gradientId: string;
}

export function ClippedAreaChart({
  data,
  description,
  badge,
  gradientId,
}: ClippedAreaChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [axis, setAxis] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const springX = useSpring(0, { damping: 30, stiffness: 100 });
  const springY = useSpring(
    data.length > 0 ? data[data.length - 1].pageViews : 0,
    { damping: 30, stiffness: 100 }
  );

  useMotionValueEvent(springX, "change", (latest) => {
    setAxis(latest);
  });

  useEffect(() => {
    const node = chartRef.current;
    if (!node) return;

    const updateWidth = () => setContainerWidth(node.getBoundingClientRect().width);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const clipRight = Math.max(0, containerWidth - axis);

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span className="tabular-nums">
            {Math.round(springY.get()).toLocaleString()}
          </span>
          {badge}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div ref={chartRef} className="relative w-full min-w-0 overflow-hidden">
          <ChartContainer
            className="h-[220px] w-full min-w-0"
            config={PAGE_VIEWS_CHART_CONFIG}
          >
            <AreaChart
              accessibilityLayer
              data={data}
              onMouseMove={(state) => {
                const x = state.activeCoordinate?.x;
                const dataValue = state.activePayload?.[0]?.value;
                if (x !== undefined && dataValue !== undefined) {
                  springX.set(x);
                  springY.set(dataValue);
                }
              }}
              onMouseLeave={() => {
                const w = chartRef.current?.getBoundingClientRect().width ?? 0;
                springX.set(w);
                springY.jump(
                  data.length > 0 ? data[data.length - 1].pageViews : 0
                );
              }}
              margin={{ right: 0, left: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                horizontalCoordinatesGenerator={(props) => {
                  const { height } = props;
                  return [0, height - 30];
                }}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Area
                dataKey="pageViews"
                type="monotone"
                fill={`url(#${gradientId})`}
                fillOpacity={0.4}
                stroke="var(--color-pageViews)"
                clipPath={`inset(0 ${clipRight}px 0 0)`}
              />
              <line
                x1={axis}
                y1={0}
                x2={axis}
                y2="85%"
                stroke="var(--color-pageViews)"
                strokeDasharray="3 3"
                strokeLinecap="round"
                strokeOpacity={0.2}
              />
              <rect
                x={axis - 50}
                y={0}
                width={50}
                height={18}
                fill="var(--color-pageViews)"
              />
              <text
                x={axis - 25}
                fontWeight={600}
                y={13}
                textAnchor="middle"
                fill="var(--primary-foreground)"
              >
                {Math.round(springY.get()).toLocaleString()}
              </text>
              <Area
                dataKey="pageViews"
                type="monotone"
                fill="none"
                stroke="var(--color-pageViews)"
                strokeOpacity={0.1}
              />
              <defs>
                <linearGradient
                  id={gradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-pageViews)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-pageViews)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
