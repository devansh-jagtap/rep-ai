"use client";

import { useEffect, useRef } from "react";
import { usePortfolioStore, type PortfolioSummary } from "@/lib/stores/portfolio-store";

interface PortfolioProviderProps {
    portfolios: PortfolioSummary[];
    activePortfolioId: string;
    children: React.ReactNode;
}

/**
 * Hydrates the Zustand portfolio store from server-fetched data.
 * Rendered once in DashboardLayout — all client components beneath it
 * can then use `usePortfolioStore()` without prop-drilling.
 */
export function PortfolioProvider({
    portfolios,
    activePortfolioId,
    children,
}: PortfolioProviderProps) {
    const setPortfolios = usePortfolioStore((s) => s.setPortfolios);
    const initialized = useRef(false);

    useEffect(() => {
        // Always re-hydrate when server data changes (e.g., after router.refresh())
        setPortfolios(portfolios, activePortfolioId);
        initialized.current = true;
    }, [portfolios, activePortfolioId, setPortfolios]);

    return <>{children}</>;
}
