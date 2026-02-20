import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LeadListItemData } from "./types"

function formatShortDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date)
}

function confidenceTier(confidence: number) {
  if (confidence >= 80) return "hot"
  if (confidence >= 50) return "warm"
  return "cold"
}

function confidenceBadgeClass(confidence: number) {
  const tier = confidenceTier(confidence)
  if (tier === "hot") return "bg-red-500/10 text-red-600 border-red-500/20"
  if (tier === "warm") return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
  return "bg-blue-500/10 text-blue-600 border-blue-500/20"
}

function confidenceLabel(confidence: number) {
  const tier = confidenceTier(confidence)
  if (tier === "hot") return "Hot"
  if (tier === "warm") return "Warm"
  return "Cold"
}

export function LeadListItem({
  lead,
  selected,
  onSelect,
}: {
  lead: LeadListItemData
  selected: boolean
  onSelect: () => void
}) {
  const isUnread = lead.isRead === false

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left group flex gap-3 px-3 py-3 rounded-xl transition-colors",
        "hover:bg-muted/50",
        selected && "bg-muted"
      )}
    >
      <div className="pt-2">
        <span
          className={cn(
            "block size-2 rounded-full transition-opacity",
            isUnread ? "bg-primary opacity-100" : "opacity-0"
          )}
          aria-hidden
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className={cn("truncate font-medium", isUnread && "font-semibold")}>
            {lead.name || "Anonymous"}
          </p>
          <p className="shrink-0 text-xs text-muted-foreground">
            {formatShortDate(lead.createdAt)}
          </p>
        </div>

        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {lead.subject || "No subject"}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {lead.budget ? (
            <Badge variant="secondary" className="rounded-full">
              {lead.budget}
            </Badge>
          ) : null}

          <Badge
            variant="outline"
            className={cn("rounded-full", confidenceBadgeClass(lead.confidence))}
          >
            {confidenceLabel(lead.confidence)} ({Math.round(lead.confidence)}%)
          </Badge>
        </div>
      </div>
    </button>
  )
}

