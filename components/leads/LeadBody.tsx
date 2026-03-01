import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LeadDetailData } from "./types"
import { WarmIntroCard } from "./WarmIntroCard"

function cleanText(input: string) {
  return input.replace(/\s+/g, " ").trim()
}

export function LeadBody({ lead }: { lead: LeadDetailData }) {
  const summaryRaw = lead.conversationSummary?.trim() || ""
  const detailsRaw = lead.projectDetails?.trim() || ""

  const summary = summaryRaw ? cleanText(summaryRaw) : ""

  return (
    <div className="space-y-4">
      <WarmIntroCard lead={lead} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Project Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-foreground/90">
          {summary ? (
            <p>{summary}</p>
          ) : detailsRaw ? (
            <p className="whitespace-pre-wrap">{detailsRaw}</p>
          ) : (
            <p className="text-muted-foreground">No summary captured yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-muted-foreground">Timeline</dt>
              <dd className="font-medium">{lead.timeline || "—"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground">Meeting Time</dt>
              <dd className="font-medium">{lead.meetingTime || "—"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground">Budget</dt>
              <dd className="font-medium">{lead.budget || "—"}</dd>
            </div>
          </dl>

          <div className="space-y-2">
            <p className="text-muted-foreground">Project details</p>
            <div className="rounded-xl border bg-muted/30 p-4 whitespace-pre-wrap leading-relaxed">
              {detailsRaw || "—"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
