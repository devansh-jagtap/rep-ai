import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { LeadDetailData, LeadStatus } from "./types"
import { LeadHeader } from "./LeadHeader"
import { LeadBody } from "./LeadBody"

export function LeadViewer({
  lead,
  onStatusChange,
}: {
  lead: LeadDetailData | null
  onStatusChange: (status: LeadStatus) => void
}) {
  if (!lead) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Select a lead to view details
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-full min-h-0 overflow-hidden flex flex-col">
      <ScrollArea className="h-full min-h-0 flex-1">
        <div className="p-4 md:p-6">
          <LeadHeader lead={lead} onStatusChange={onStatusChange} />
          <Separator className="my-5" />
          <LeadBody lead={lead} />
        </div>
      </ScrollArea>
    </Card>
  )
}

