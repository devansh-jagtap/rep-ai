import { create } from "zustand";

type Period = "24h" | "7d" | "30d";

interface AnalyticsState {
  period: Period;
  setPeriod: (period: Period) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  period: "7d",
  setPeriod: (period) => set({ period }),
}));
