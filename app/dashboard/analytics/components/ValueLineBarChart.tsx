"use client";

import { useMemo, useState, useEffect } from "react";
import { Bar, BarChart, Cell, XAxis, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { AnimatePresence, useMotionValueEvent, useSpring } from "motion/react";
import { CHART_MARGIN, CHAT_SESSIONS_CHART_CONFIG } from "../constants";
import type { ChartDataPoint } from "../types";

interface ValueLineBarChartProps {
  data: ChartDataPoint[];
  description: string;
  badge?: React.ReactNode;
}

function CustomReferenceLabel({
  viewBox,
  value,
}: {
  viewBox?: { x?: number; y?: number };
  value: number;
}) {
  const x = viewBox?.x ?? 0;
  const y = viewBox?.y ?? 0;
  const width = useMemo(() => {
    const characterWidth = 8;
    const padding = 10;
    return value.toString().length * characterWidth + padding;
  }, [value]);

  return (
    <>
      <rect
        x={x - CHART_MARGIN}
        y={y - 9}
        width={width}
        height={18}
        fill="var(--color-chatSessions)"
        rx={4}
      />
      <text
        fontWeight={600}
        x={x - CHART_MARGIN + 6}
        y={y + 4}
        fill="var(--primary-foreground)"
      >
        {value}
      </text>
    </>
  );
}

export function ValueLineBarChart({
  data,
  description,
  badge,
}: ValueLineBarChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const maxValueIndex = useMemo(() => {
    if (activeIndex !== undefined) {
      return { index: activeIndex, value: data[activeIndex].chatSessions };
    }
    return data.reduce(
      (max, d, i) =>
        d.chatSessions > max.value ? { index: i, value: d.chatSessions } : max,
      { index: 0, value: 0 }
    );
  }, [activeIndex, data]);

  const maxValueIndexSpring = useSpring(maxValueIndex.value, {
    stiffness: 100,
    damping: 20,
  });

  const [springyValue, setSpringyValue] = useState(maxValueIndex.value);

  useMotionValueEvent(maxValueIndexSpring, "change", (latest) => {
    setSpringyValue(Number(latest.toFixed(0)));
  });

  useEffect(() => {
    maxValueIndexSpring.set(maxValueIndex.value);
  }, [maxValueIndex.value, maxValueIndexSpring]);

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span
            className="text-2xl tracking-tighter font-mono"
          >
            {maxValueIndex.value.toLocaleString()}
          </span>
          {badge}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <AnimatePresence mode="wait">
          <ChartContainer
            config={CHAT_SESSIONS_CHART_CONFIG}
            className="min-h-[220px] w-full min-w-0"
          >
            <BarChart
              accessibilityLayer
              data={data}
              onMouseLeave={() => setActiveIndex(undefined)}
              margin={{ left: CHART_MARGIN }}
            >
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <Bar
                dataKey="chatSessions"
                fill="var(--color-chatSessions)"
                radius={[4, 4, 0, 0]}
              >
                {data.map((_, index) => (
                  <Cell
                    className="duration-200"
                    opacity={index === maxValueIndex.index ? 1 : 0.2}
                    key={index}
                    onMouseEnter={() => setActiveIndex(index)}
                  />
                ))}
              </Bar>
              <ReferenceLine
                opacity={0.4}
                y={springyValue}
                stroke="var(--color-chatSessions)"
                strokeWidth={1}
                strokeDasharray="3 3"
                label={<CustomReferenceLabel value={maxValueIndex.value} />}
              />
            </BarChart>
          </ChartContainer>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
