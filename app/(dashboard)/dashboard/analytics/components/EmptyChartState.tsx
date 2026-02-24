import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

interface EmptyChartStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyChartState({ title, description, action }: EmptyChartStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground">
          No data yet
          {action ? <div className="text-foreground">{action}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
