"use client"

import { useMemo, useState } from "react"
import { Loader2, MailPlus, Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { LeadDetailData } from "./types"

interface WarmIntroDraft {
  subject: string
  body: string
}

async function generateDraft(leadId: string): Promise<WarmIntroDraft> {
  const res = await fetch(`/api/leads/${leadId}/warm-intro`, { method: "POST" })
  const payload = (await res.json().catch(() => null)) as
    | { draft?: WarmIntroDraft; error?: string }
    | null

  if (!res.ok || !payload?.draft) {
    throw new Error(payload?.error || "Failed to generate warm intro")
  }

  return payload.draft
}

export function WarmIntroCard({ lead }: { lead: LeadDetailData }) {
  const [isLoading, setIsLoading] = useState(false)
  const [draft, setDraft] = useState<WarmIntroDraft | null>(null)

  const mailToHref = useMemo(() => {
    if (!lead.email || !draft) return null
    const subject = encodeURIComponent(draft.subject)
    const body = encodeURIComponent(draft.body)
    return `mailto:${lead.email}?subject=${subject}&body=${body}`
  }, [draft, lead.email])

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const nextDraft = await generateDraft(lead.id)
      setDraft(nextDraft)
      toast.success("Warm intro draft ready")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate warm intro")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!draft) return
    const compiled = `Subject: ${draft.subject}\n\n${draft.body}`

    try {
      await navigator.clipboard.writeText(compiled)
      toast.success("Warm intro copied")
    } catch {
      toast.error("Could not copy draft")
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm">Warm Intro Email</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <MailPlus className="mr-2 size-4" />}
            {draft ? "Regenerate" : "Generate draft"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {draft ? (
          <>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Subject</p>
              <p className="rounded-md border bg-muted/20 px-3 py-2 text-sm font-medium">{draft.subject}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Email body</p>
              <Textarea value={draft.body} readOnly className="min-h-[180px] resize-y text-sm" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={handleCopy}>
                <Copy className="mr-2 size-4" />
                Copy draft
              </Button>
              <Button type="button" size="sm" variant="outline" asChild disabled={!mailToHref}>
                <a href={mailToHref ?? "#"}>
                  Open in email
                </a>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Generate a personalized follow-up email pre-filled with the lead context and recent conversation.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
