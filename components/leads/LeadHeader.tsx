import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { getLeadConfidenceBadgeClass, getLeadConfidenceLabel } from "./lead-confidence"
import { Copy, Mail, ChevronDown, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import type { LeadDetailData, LeadStatus } from "./types"


function formatFullDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date)
}

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
}

export function LeadHeader({
  lead,
  onStatusChange,
}: {
  lead: LeadDetailData
  onStatusChange: (status: LeadStatus) => void
}) {
  const status = (lead.status ?? "new") as LeadStatus

  const handleCopyEmail = async () => {
    if (!lead.email) return
    try {
      await navigator.clipboard.writeText(lead.email)
      toast.success("Email copied")
    } catch {
      toast.error("Could not copy email")
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight truncate">
            {lead.name || "Anonymous"}
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {lead.email ? (
              <>
                <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                  <Mail className="size-4" />
                  <span className="truncate max-w-[220px]">{lead.email}</span>
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopyEmail}
                  title="Copy email"
                >
                  <Copy className="size-4" />
                </Button>
              </>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-xs text-muted-foreground pt-1">
          {formatFullDate(lead.createdAt)}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full h-8 px-3">
              Status: {STATUS_LABEL[status]}
              <ChevronDown className="ml-2 size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {(Object.keys(STATUS_LABEL) as LeadStatus[]).map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => onStatusChange(s)}
                className={cn(s === status && "bg-muted")}
              >
                {STATUS_LABEL[s]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" className="rounded-full h-8 px-3" asChild>
          <Link href={`/dashboard/leads/${lead.id}/chats`}>
            <MessageCircle className="mr-2 size-4" />
            View Chats
          </Link>
        </Button>
      </div>
    </div>
  )
}

