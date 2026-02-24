import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface PortfolioSummary {
    id: string;
    name: string;
    handle: string;
    isPublished: boolean;
}

interface PortfolioState {
    /** All portfolios belonging to the current user */
    portfolios: PortfolioSummary[];
    /** The currently active portfolio id */
    activePortfolioId: string;
    /** Whether a switch is in progress */
    isSwitching: boolean;

    // ── Actions ────────────────────────────────────────────────────────
    /** Seed/replace the full list from the server (called once on layout mount) */
    setPortfolios: (portfolios: PortfolioSummary[], activeId: string) => void;
    /** Switch to a different portfolio – hits the API and updates cookie + local state */
    switchPortfolio: (portfolioId: string) => Promise<void>;
    /** Update a single portfolio's data in-place (e.g. after rename or publish toggle) */
    updatePortfolio: (id: string, patch: Partial<PortfolioSummary>) => void;
    /** Append a newly-created portfolio and make it active */
    addPortfolio: (portfolio: PortfolioSummary) => void;
    /** Remove a portfolio from the list */
    removePortfolio: (id: string) => void;

    // ── Derived helpers ────────────────────────────────────────────────
    getActivePortfolio: () => PortfolioSummary | undefined;
}

export const usePortfolioStore = create<PortfolioState>()(
    subscribeWithSelector((set, get) => ({
        portfolios: [],
        activePortfolioId: "",
        isSwitching: false,

        setPortfolios: (portfolios, activeId) =>
            set({ portfolios, activePortfolioId: activeId }),

        switchPortfolio: async (portfolioId: string) => {
            const { portfolios, activePortfolioId } = get();
            if (portfolioId === activePortfolioId) return;

            // Optimistically update local state immediately for snappy UX
            const prev = activePortfolioId;
            set({ activePortfolioId: portfolioId, isSwitching: true });

            try {
                const res = await fetch("/api/portfolios/switch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ portfolioId }),
                });

                if (!res.ok) {
                    // Roll back on failure
                    set({ activePortfolioId: prev, isSwitching: false });
                    console.error("Failed to switch portfolio");
                    return;
                }
            } catch {
                set({ activePortfolioId: prev, isSwitching: false });
                return;
            } finally {
                set({ isSwitching: false });
            }
        },

        updatePortfolio: (id, patch) =>
            set((state) => ({
                portfolios: state.portfolios.map((p) =>
                    p.id === id ? { ...p, ...patch } : p
                ),
            })),

        addPortfolio: (portfolio) =>
            set((state) => ({
                portfolios: [portfolio, ...state.portfolios],
                activePortfolioId: portfolio.id,
            })),

        removePortfolio: (id) =>
            set((state) => {
                const remaining = state.portfolios.filter((p) => p.id !== id);
                const activeId =
                    state.activePortfolioId === id
                        ? (remaining[0]?.id ?? "")
                        : state.activePortfolioId;
                return { portfolios: remaining, activePortfolioId: activeId };
            }),

        getActivePortfolio: () => {
            const { portfolios, activePortfolioId } = get();
            return portfolios.find((p) => p.id === activePortfolioId);
        },
    }))
);
