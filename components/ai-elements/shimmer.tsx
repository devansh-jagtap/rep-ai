"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerProps extends React.HTMLAttributes<HTMLElement> {
  children: string;
  as?: React.ElementType;
  duration?: number;
  className?: string;
}

export const Shimmer = memo(function Shimmer({
  children,
  as: Component = "span",
  duration = 2,
  className,
  style,
  ...props
}: ShimmerProps) {
  return (
    <Component
      className={cn(
        "inline-block bg-clip-text text-transparent",
        "bg-size-[200%_100%] bg-position-[200%_0] bg-no-repeat",
        "animate-[shimmer-sweep_2s_linear_infinite]",
        className
      )}
      style={{
        ...style,
        backgroundImage:
          "linear-gradient(90deg, var(--muted-foreground) 0%, var(--muted-foreground) 40%, var(--foreground) 50%, var(--muted-foreground) 60%, var(--muted-foreground) 100%)",
        animationDuration: `${duration}s`,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </Component>
  );
});
