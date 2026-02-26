import type { LeadListItemData } from "./types"
import { getLeadConfidenceTier } from "./lead-confidence"

export type LeadNotification = {
  id: string
  type: "new-lead"
  title: string
  message: string
  createdAt: string
  leadId: string
  confidence?: number
  budget?: string | null
  isRead: boolean
}

export type NotificationState = {
  notifications: LeadNotification[]
  lastOpenedAt: string | null
}

export type WeeklyLeadRundown = {
  total: number
  hot: number
  warm: number
  cold: number
  topBudget: string | null
}

export function computeWeeklyLeadRundown(leads: LeadListItemData[]): WeeklyLeadRundown {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const weeklyLeads = leads.filter((lead) => {
    const createdAt = new Date(lead.createdAt).getTime()
    return Number.isFinite(createdAt) && createdAt >= sevenDaysAgo
  })

  let hot = 0
  let warm = 0
  let cold = 0

  for (const lead of weeklyLeads) {
    const tier = getLeadConfidenceTier(lead.confidence)
    if (tier === "hot") hot += 1
    else if (tier === "warm") warm += 1
    else cold += 1
  }

  const topBudget = weeklyLeads.find((lead) => lead.budget)?.budget ?? null

  return {
    total: weeklyLeads.length,
    hot,
    warm,
    cold,
    topBudget,
  }
}
