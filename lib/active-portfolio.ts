/**
 * Active Portfolio Resolution
 *
 * Determines which portfolio the logged-in user is currently "working in".
 * Priority: cookie > first portfolio in list (most recently created)
 *
 * The cookie `active_portfolio_id` is set when the user switches portfolios
 * via the sidebar switcher or after completing onboarding.
 */

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { portfolios } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export const ACTIVE_PORTFOLIO_COOKIE = "active_portfolio_id";

/**
 * Returns the active portfolio for a user, or null if they have none.
 * Respects the cookie, falling back to their most recently created portfolio.
 */
export async function getActivePortfolio(userId: string) {
    try {
        const cookieStore = await cookies();
        const cookiePortfolioId = cookieStore.get(ACTIVE_PORTFOLIO_COOKIE)?.value;

        // Fetch all portfolios for this user
        const userPortfolios = await db
            .select()
            .from(portfolios)
            .where(eq(portfolios.userId, userId))
            .orderBy(desc(portfolios.createdAt));

        if (userPortfolios.length === 0) return null;

        // Try to find the cookie-specified portfolio (must belong to this user)
        if (cookiePortfolioId) {
            const found = userPortfolios.find((p) => p.id === cookiePortfolioId);
            if (found) return found;
        }

        // Default to most recently created portfolio
        return userPortfolios[0];
    } catch (error) {
        console.error("Failed to get active portfolio", error);
        return null;
    }
}

/**
 * Returns all portfolios for a user, ordered by creation date (newest first).
 */
export async function getAllPortfolios(userId: string) {
    try {
        return await db
            .select()
            .from(portfolios)
            .where(eq(portfolios.userId, userId))
            .orderBy(desc(portfolios.createdAt));
    } catch (error) {
        console.error("Failed to fetch user portfolios", error);
        return [];
    }
}
