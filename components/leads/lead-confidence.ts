import { cn } from "@/lib/utils"
import type { LeadConfidenceTier } from "./types"

export function getLeadConfidenceTier(confidence: number): LeadConfidenceTier {
  if (confidence >= 80) return "hot"
  if (confidence >= 50) return "warm"
  return "cold"
}

export function getLeadConfidenceLabel(confidence: number) {
  const tier = getLeadConfidenceTier(confidence)
  if (tier === "hot") return "Hot"
  if (tier === "warm") return "Warm"
  return "Cold"
}

export function getLeadConfidenceBadgeClass(confidence: number) {
  const tier = getLeadConfidenceTier(confidence)
  if (tier === "hot") return "bg-red-500/10 text-red-600 border-red-500/20"
  if (tier === "warm") return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
  return "bg-blue-500/10 text-blue-600 border-blue-500/20"
}

export function getLeadConfidenceBadgeClasses(confidence: number) {
  return cn("rounded-full", getLeadConfidenceBadgeClass(confidence))
}
