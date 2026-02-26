"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { LeadViewer } from "@/components/leads/LeadViewer"
import type { LeadDetailData, LeadStatus } from "@/components/leads/types"

async function patchRead(id: string) {
  await fetch(`/api/leads/${id}/read`, { method: "PATCH" })
}

async function patchStatus(id: string, status: LeadStatus) {
  const res = await fetch(`/api/leads/${id}/status`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error || "Failed to update status")
  }
}

export function LeadDetailClient({ lead: initialLead }: { lead: LeadDetailData }) {
  const router = useRouter()
  const [lead, setLead] = useState<LeadDetailData>(() =>
    initialLead.isRead === false ? { ...initialLead, isRead: true } : initialLead
  )

  useEffect(() => {
    if (lead.isRead === false) {
      void patchRead(lead.id)
    }
  }, [lead.id, lead.isRead])

  const handleStatusChange = async (status: LeadStatus) => {
    const previous = (lead.status ?? "new") as LeadStatus
    setLead((prev) => ({ ...prev, status }))

    try {
      await patchStatus(lead.id, status)
      toast.success("Status updated")
    } catch (e) {
      setLead((prev) => ({ ...prev, status: previous }))
      toast.error(e instanceof Error ? e.message : "Failed to update status")
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto md:h-[calc(100vh-11rem)]">
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="-ml-2" onClick={() => router.push("/dashboard/leads")}>
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="h-[75vh] md:h-full">
        <LeadViewer lead={lead} onStatusChange={handleStatusChange} />
      </div>
    </div>
  )
}

