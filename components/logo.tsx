import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn("font-semibold text-lg tracking-tight", className)}
      aria-hidden
    >
      AI SaaS
    </span>
  )
}
