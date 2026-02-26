"use client";

import { Button } from "@/components/ui/button";
import { PERIOD_LABELS } from "../constants";
import type { Period } from "../types";

interface AnalyticsHeaderProps {
  period: Period;
  isFetching: boolean;
  onPeriodChange: (period: Period) => void;
}

export function AnalyticsHeader({
  period,
  isFetching,
  onPeriodChange,
}: AnalyticsHeaderProps) {
  const periods: Period[] = ["24h", "7d", "30d"];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track how visitors interact with your portfolio and AI agent.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {periods.map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => onPeriodChange(p)}
          >
            {PERIOD_LABELS[p]}
            {isFetching && period === p && (
              <span className="ml-2 h-2 w-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
