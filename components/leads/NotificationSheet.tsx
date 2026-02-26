"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { getLeadConfidenceBadgeClass, getLeadConfidenceLabel } from "./lead-confidence"
import type { LeadListItemData } from "./types"
import {
  computeWeeklyLeadRundown,
  type LeadNotification,
  type NotificationState,
} from "./notifications"

const STORAGE_KEY = "lead-notifications"

function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date)
}

export function NotificationSheet({
  leads,
  onSelectLead,
}: {
  leads: LeadListItemData[]
  onSelectLead?: (leadId: string) => void
}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<NotificationState>({ notifications: [], lastOpenedAt: null })
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const nowIso = new Date().toISOString()

    if (raw) {
      const parsed = JSON.parse(raw) as NotificationState
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({
        notifications: parsed.notifications ?? [],
        lastOpenedAt: parsed.lastOpenedAt ?? nowIso,
      })
    } else {
      setState({ notifications: [], lastOpenedAt: nowIso })
    }

    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [isHydrated, state])

  useEffect(() => {
    if (!isHydrated || !state.lastOpenedAt) return

    const lastOpened = new Date(state.lastOpenedAt).getTime()
    if (!Number.isFinite(lastOpened)) return

    const existingLeadIds = new Set(state.notifications.map((notification) => notification.leadId))
    const additions: LeadNotification[] = []

    for (const lead of leads) {
      const createdAt = new Date(lead.createdAt).getTime()
      if (!Number.isFinite(createdAt)) continue
      if (createdAt <= lastOpened) continue
      if (lead.isRead !== false) continue
      if (existingLeadIds.has(lead.id)) continue

      additions.push({
        id: lead.id,
        type: "new-lead",
        title: lead.name || "Anonymous",
        message: lead.subject || "New lead received",
        createdAt: lead.createdAt,
        leadId: lead.id,
        confidence: lead.confidence,
        budget: lead.budget,
        isRead: false,
      })
    }

    if (additions.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((prev) => ({
        ...prev,
        notifications: [...additions, ...prev.notifications],
      }))
    }
  }, [isHydrated, leads, state.lastOpenedAt, state.notifications])

  const weekly = useMemo(() => computeWeeklyLeadRundown(leads), [leads])
  const hasUnread = state.notifications.some((notification) => !notification.isRead)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setState((prev) => ({ ...prev, lastOpenedAt: new Date().toISOString() }))
    }
  }

  const markAllRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification) => ({ ...notification, isRead: true })),
    }))
  }

  const handleOpenNotification = (notificationId: string, leadId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification
      ),
    }))
    if (onSelectLead) {
      onSelectLead(leadId)
    } else {
      router.push(`/dashboard/leads?selected=${leadId}`)
    }
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Open notifications">
          <Bell className="size-4" />
          {hasUnread ? (
            <span className="absolute right-2 top-2 inline-flex size-2 rounded-full bg-red-500" aria-hidden />
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-3xl">Notifications</SheetTitle>
          <SheetDescription>New leads and your weekly rundown.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col px-6 gap-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-sans font-semibold">New leads</h3>
              {hasUnread ? (
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={markAllRead}>
                  Mark all as read
                </Button>
              ) : null}
            </div>

            {state.notifications.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  You&apos;re all caught up.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  No new leads since you last checked.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {state.notifications.map((notification) => {
                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleOpenNotification(notification.id, notification.leadId)}
                      className={cn(
                        "w-full rounded-xl border p-4 text-left transition-all hover:bg-muted/50",
                        !notification.isRead ? "border-primary/30 bg-primary/5 shadow-sm" : "bg-background"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <span className="flex size-2 rounded-full bg-primary shrink-0" />
                          )}
                          <p className={cn("text-sm", !notification.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/90")}>
                            {notification.title}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">{formatDate(notification.createdAt)}</p>
                      </div>

                      <p className={cn("text-sm text-muted-foreground line-clamp-2", !notification.isRead ? "pl-4" : "")}>
                        {notification.message}
                      </p>

                      <div className={cn("mt-3 flex items-center gap-2", !notification.isRead ? "pl-4" : "")}>
                        {notification.confidence !== undefined ? (
                          <Badge
                            variant="outline"
                            className={cn("rounded-full text-[10px] font-medium px-2 py-0 h-5", getLeadConfidenceBadgeClass(notification.confidence))}
                          >
                            {getLeadConfidenceLabel(notification.confidence)}
                          </Badge>
                        ) : null}
                        {notification.budget ? (
                          <Badge variant="secondary" className="rounded-full text-[10px] font-medium px-2 py-0 h-5">
                            {notification.budget}
                          </Badge>
                        ) : null}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-sans font-semibold">Weekly rundown</h3>
            <div className="rounded-xl border bg-muted/30 p-4 text-sm">
              {weekly.total === 0 ? (
                <p className="text-muted-foreground text-center py-2">No leads in the last 7 days.</p>
              ) : (
                <div className="space-y-4">
                  <p className="font-medium text-foreground/90">You had {weekly.total} new leads this week.</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20 font-medium">Hot: {weekly.hot}</Badge>
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-yellow-500/20 font-medium">Warm: {weekly.warm}</Badge>
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20 font-medium">Cold: {weekly.cold}</Badge>
                  </div>
                  {weekly.topBudget ? (
                    <div className="pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        Highest stated budget: <span className="font-medium text-foreground">{weekly.topBudget}</span>
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}
