import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EmptyChartStateProps {
  title: string;
  description: string;
}

export function EmptyChartState({ title, description }: EmptyChartStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed text-muted-foreground">
          No data yet
        </div>
      </CardContent>
    </Card>
  );
}
