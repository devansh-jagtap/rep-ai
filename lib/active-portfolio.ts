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

const MAX_DB_RETRIES = 2;

function isConnectionError(err: unknown): boolean {
  const code = err && typeof err === "object" && "code" in err ? (err as NodeJS.ErrnoException).code : null;
  const cause = err && typeof err === "object" && "cause" in err ? (err as { cause?: unknown }).cause : null;
  if (code === "ECONNRESET" || code === "ECONNREFUSED" || code === "ETIMEDOUT") return true;
  if (cause && typeof cause === "object" && "code" in cause) {
    const c = (cause as NodeJS.ErrnoException).code;
    if (c === "ECONNRESET" || c === "ECONNREFUSED" || c === "ETIMEDOUT") return true;
  }
  return false;
}

async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_DB_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < MAX_DB_RETRIES && isConnectionError(err)) {
        await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Returns the active portfolio for a user, or null if they have none.
 * Respects the cookie, falling back to their most recently created portfolio.
 * Retries once on connection errors (e.g. ECONNRESET).
 */
export async function getActivePortfolio(userId: string) {
    try {
        const cookieStore = await cookies();
        const cookiePortfolioId = cookieStore.get(ACTIVE_PORTFOLIO_COOKIE)?.value;

        const userPortfolios = await withDbRetry(() =>
            db
                .select()
                .from(portfolios)
                .where(eq(portfolios.userId, userId))
                .orderBy(desc(portfolios.createdAt))
        );

        if (userPortfolios.length === 0) return null;

        if (cookiePortfolioId) {
            const found = userPortfolios.find((p) => p.id === cookiePortfolioId);
            if (found) return found;
        }

        return userPortfolios[0];
    } catch (error) {
        console.error("Failed to get active portfolio", error);
        return null;
    }
}

/**
 * Returns all portfolios for a user, ordered by creation date (newest first).
 * Retries on connection errors (e.g. ECONNRESET).
 */
export async function getAllPortfolios(userId: string) {
    try {
        return await withDbRetry(() =>
            db
                .select()
                .from(portfolios)
                .where(eq(portfolios.userId, userId))
                .orderBy(desc(portfolios.createdAt))
        );
    } catch (error) {
        console.error("Failed to fetch user portfolios", error);
        return [];
    }
}
