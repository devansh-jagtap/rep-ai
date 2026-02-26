"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  onSelectLead: (leadId: string) => void
}) {
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
    if (!isHydrated) return

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
    onSelectLead(leadId)
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
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>New leads and your weekly rundown.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">New leads</h3>
              {hasUnread ? (
                <Button variant="ghost" size="sm" onClick={markAllRead}>
                  Mark all as read
                </Button>
              ) : null}
            </div>

            {state.notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You&apos;re all caught up. No new leads since you last checked.
              </p>
            ) : (
              <div className="space-y-2">
                {state.notifications.map((notification) => {
                  const lead = leads.find((item) => item.id === notification.leadId)
                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleOpenNotification(notification.id, notification.leadId)}
                      className={cn(
                        "w-full rounded-xl border p-3 text-left transition-colors hover:bg-muted/40",
                        !notification.isRead && "border-primary/30 bg-primary/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>
                        </div>
                        {notification.confidence !== undefined ? (
                          <Badge
                            variant="outline"
                            className={cn("rounded-full", getLeadConfidenceBadgeClass(notification.confidence))}
                          >
                            {getLeadConfidenceLabel(notification.confidence)} ({Math.round(notification.confidence)}%)
                          </Badge>
                        ) : null}
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>

                      <div className="mt-2 flex items-center gap-2">
                        {notification.budget ? (
                          <Badge variant="secondary" className="rounded-full">
                            {notification.budget}
                          </Badge>
                        ) : null}
                        <span className="text-xs text-muted-foreground">{lead?.name || "Anonymous"}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Weekly rundown</h3>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Weekly rundown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {weekly.total === 0 ? (
                  <p className="text-muted-foreground">No leads in the last 7 days.</p>
                ) : (
                  <>
                    <p>You had {weekly.total} new leads this week.</p>
                    <p className="text-muted-foreground text-xs">
                      Hot: {weekly.hot} • Warm: {weekly.warm} • Cold: {weekly.cold}
                    </p>
                    {weekly.topBudget ? (
                      <p className="text-xs text-muted-foreground">
                        Highest stated budget: {weekly.topBudget}
                      </p>
                    ) : null}
                  </>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}
