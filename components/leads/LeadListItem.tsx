import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getLeadConfidenceBadgeClass, getLeadConfidenceLabel } from "./lead-confidence"
import type { LeadListItemData } from "./types"

const STATUS_LABEL: Record<NonNullable<LeadListItemData["status"]>, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
}

function formatShortDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date)
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
  const status = lead.status ?? "new"

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full min-w-0 overflow-hidden text-left group flex gap-3 px-3 py-3 rounded-xl transition-colors",
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

        <p
          className="mt-0.5 truncate text-sm text-muted-foreground"
          title={lead.subject || "No subject"}
        >
          {lead.subject || "No subject"}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full">
            {STATUS_LABEL[status]}
          </Badge>

          {lead.budget ? (
            <Badge variant="secondary" className="rounded-full">
              {lead.budget}
            </Badge>
          ) : null}

          <Badge
            variant="outline"
            className={cn("rounded-full", getLeadConfidenceBadgeClass(lead.confidence))}
          >
            {getLeadConfidenceLabel(lead.confidence)} ({Math.round(lead.confidence)}%)
          </Badge>
        </div>
      </div>
    </button>
  )
}
