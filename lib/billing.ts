import { db, getProfileById } from "./db";
import { portfolios, agents, aiTelemetryEvents } from "./schema";
import { eq, count, and, gte, lte } from "drizzle-orm";
import { startOfMonth, endOfMonth } from "date-fns";

export type PlanTier = "free" | "pro" | "business";

export const PLAN_LIMITS = {
    free: {
        portfolios: 1,
        agents: 1,
        aiMessagesPerMonth: 100,
        canUseCalendar: false,
        canCustomDomain: false,
    },
    pro: {
        portfolios: 3,
        agents: 3,
        aiMessagesPerMonth: 1000,
        canUseCalendar: true,
        canCustomDomain: true,
    },
    business: {
        portfolios: 10,
        agents: 10,
        aiMessagesPerMonth: 10000,
        canUseCalendar: true,
        canCustomDomain: true,
    },
} as const;

export async function getUserPlan(userId: string): Promise<PlanTier> {
    const profile = await getProfileById(userId);
    if (!profile) return "free";

    // Normalize missing or invalid plans to "free"
    const plan = (profile.plan || "free").toLowerCase();
    if (plan === "free" || plan === "pro" || plan === "business") {
        return plan as PlanTier;
    }
    return "free";
}

export async function checkPortfolioLimit(userId: string): Promise<{ allowed: boolean; currentCount: number; limit: number }> {
    const plan = await getUserPlan(userId);
    const limit = PLAN_LIMITS[plan].portfolios;

    const [{ value }] = await db
        .select({ value: count() })
        .from(portfolios)
        .where(eq(portfolios.userId, userId));

    return {
        allowed: value < limit,
        currentCount: value,
        limit,
    };
}

export async function checkAgentLimit(userId: string): Promise<{ allowed: boolean; currentCount: number; limit: number }> {
    const plan = await getUserPlan(userId);
    const limit = PLAN_LIMITS[plan].agents;

    const [{ value }] = await db
        .select({ value: count() })
        .from(agents)
        .where(eq(agents.userId, userId));

    return {
        allowed: value < limit,
        currentCount: value,
        limit,
    };
}

export async function checkAiMessageLimit(userId: string): Promise<{ allowed: boolean; currentCount: number; limit: number }> {
    const plan = await getUserPlan(userId);
    const limit = PLAN_LIMITS[plan].aiMessagesPerMonth;

    // We find limits based on telemetry events in the current month matching the user's agents
    // First, get all agents for this user
    const userAgents = await db
        .select({ id: agents.id })
        .from(agents)
        .where(eq(agents.userId, userId));

    if (userAgents.length === 0) {
        return { allowed: true, currentCount: 0, limit };
    }

    const agentIds = userAgents.map(a => a.id);

    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    // Note: we might need a more resilient query if they have many agents, 
    // but currently Drizzle doesn't have an `inArray` that works perfectly with `undefined`
    // We'll iterate for simplicity and accuracy if agent count is small, OR use a raw query

    // Since userAgents length is usually small (1-10), we can just do this:
    let totalMessages = 0;
    for (const agentId of agentIds) {
        const [{ value }] = await db
            .select({ value: count() })
            .from(aiTelemetryEvents)
            .where(
                and(
                    eq(aiTelemetryEvents.agentId, agentId),
                    eq(aiTelemetryEvents.eventType, "chat_message"),
                    gte(aiTelemetryEvents.createdAt, start),
                    lte(aiTelemetryEvents.createdAt, end)
                )
            );
        totalMessages += value;
    }

    return {
        allowed: totalMessages < limit,
        currentCount: totalMessages,
        limit,
    };
}

export async function canUseCalendar(userId: string): Promise<boolean> {
    const plan = await getUserPlan(userId);
    return PLAN_LIMITS[plan].canUseCalendar;
}
