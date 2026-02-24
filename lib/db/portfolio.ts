import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { agents, portfolios } from "@/lib/schema";

export type PortfolioTone = "Professional" | "Friendly" | "Bold" | "Minimal";

export interface PortfolioProjectInput {
  title: string;
  description: string;
}

export interface PortfolioOnboardingData {
  setupPath?: "existing-site" | "build-new";
  name: string;
  title: string;
  bio: string;
  services: string[];
  projects?: PortfolioProjectInput[];
  siteUrl?: string;
  targetAudience?: string;
  contactPreferences?: string;
  faqs?: string[];
  tone: PortfolioTone;
  handle: string;
}

export interface CreatePortfolioInput {
  userId: string;
  handle: string;
  name?: string;
  onboardingData: PortfolioOnboardingData;
}

/** Returns the first (newest) portfolio for a user. */
export async function getPortfolioByUserId(userId: string) {
  try {
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .orderBy(desc(portfolios.createdAt))
      .limit(1);
    return portfolio ?? null;
  } catch (error) {
    console.error("Failed to fetch portfolio by user id", error);
    return null;
  }
}

/** Returns all portfolios for a user, newest first. */
export async function getPortfoliosByUserId(userId: string) {
  try {
    return await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .orderBy(desc(portfolios.createdAt));
  } catch (error) {
    console.error("Failed to fetch portfolios by user id", error);
    return [];
  }
}

/** Returns a specific portfolio by ID, verifying it belongs to the given user. */
export async function getPortfolioByIdAndUserId(id: string, userId: string) {
  try {
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(and(eq(portfolios.id, id), eq(portfolios.userId, userId)))
      .limit(1);
    return portfolio ?? null;
  } catch (error) {
    console.error("Failed to fetch portfolio by id and user id", error);
    return null;
  }
}

export async function getPortfolioByHandle(handle: string) {
  try {
    const [portfolio] = await db
      .select({
        id: portfolios.id,
        handle: portfolios.handle,
        template: portfolios.template,
        isPublished: portfolios.isPublished,
        content: portfolios.content,
      })
      .from(portfolios)
      .where(eq(portfolios.handle, handle))
      .limit(1);
    return portfolio ?? null;
  } catch (error) {
    console.error("Failed to fetch portfolio by handle", error);
    return null;
  }
}

/** Returns all published portfolios, newest first. Used for explore/discovery. */
export async function getAllPublishedPortfolios() {
  try {
    return await db
      .select({
        handle: portfolios.handle,
        template: portfolios.template,
        content: portfolios.content,
        name: portfolios.name,
        createdAt: portfolios.createdAt,
      })
      .from(portfolios)
      .where(eq(portfolios.isPublished, true))
      .orderBy(desc(portfolios.createdAt));
  } catch (error) {
    console.error("Failed to fetch published portfolios", error);
    return [];
  }
}

export async function getPublishedPortfolioByHandle(handle: string) {
  try {
    const [portfolio] = await db
      .select({
        handle: portfolios.handle,
        template: portfolios.template,
        content: portfolios.content,
      })
      .from(portfolios)
      .where(and(eq(portfolios.handle, handle), eq(portfolios.isPublished, true)))
      .limit(1);
    return portfolio ?? null;
  } catch (error) {
    console.error("Failed to fetch published portfolio by handle", error);
    return null;
  }
}

export async function getPublishedPortfolioWithAgentByHandle(handle: string) {
  try {
    const [row] = await db
      .select({
        id: portfolios.id,
        userId: portfolios.userId,
        handle: portfolios.handle,
        template: portfolios.template,
        content: portfolios.content,
        isPublished: portfolios.isPublished,
        agentId: agents.id,
        agentIsEnabled: agents.isEnabled,
        agentModel: agents.model,
        agentBehaviorType: agents.behaviorType,
        agentStrategyMode: agents.strategyMode,
        agentCustomPrompt: agents.customPrompt,
        agentTemperature: agents.temperature,
      })
      .from(portfolios)
      .leftJoin(agents, eq(agents.portfolioId, portfolios.id))
      .where(and(eq(portfolios.handle, handle), eq(portfolios.isPublished, true)))
      .limit(1);
    return row ?? null;
  } catch (error) {
    console.error("Failed to fetch published portfolio with agent", error);
    return null;
  }
}

export async function getPortfolioWithAgentByHandle(handle: string) {
  try {
    const [row] = await db
      .select({
        id: portfolios.id,
        userId: portfolios.userId,
        handle: portfolios.handle,
        template: portfolios.template,
        content: portfolios.content,
        isPublished: portfolios.isPublished,
        agentId: agents.id,
        agentIsEnabled: agents.isEnabled,
        agentModel: agents.model,
        agentBehaviorType: agents.behaviorType,
        agentStrategyMode: agents.strategyMode,
        agentCustomPrompt: agents.customPrompt,
        agentTemperature: agents.temperature,
      })
      .from(portfolios)
      .leftJoin(agents, eq(agents.portfolioId, portfolios.id))
      .where(eq(portfolios.handle, handle))
      .limit(1);
    return row ?? null;
  } catch (error) {
    console.error("Failed to fetch portfolio with agent", error);
    return null;
  }
}

export async function getPublishedPortfolioWithAgentByAgentId(agentId: string) {
  try {
    const [row] = await db
      .select({
        id: portfolios.id,
        userId: portfolios.userId,
        handle: portfolios.handle,
        template: portfolios.template,
        content: portfolios.content,
        isPublished: portfolios.isPublished,
        agentId: agents.id,
        agentIsEnabled: agents.isEnabled,
        agentModel: agents.model,
        agentBehaviorType: agents.behaviorType,
        agentStrategyMode: agents.strategyMode,
        agentCustomPrompt: agents.customPrompt,
        agentTemperature: agents.temperature,
      })
      .from(portfolios)
      .innerJoin(agents, eq(agents.portfolioId, portfolios.id))
      .where(and(eq(agents.id, agentId), eq(portfolios.isPublished, true)))
      .limit(1);
    return row ?? null;
  } catch (error) {
    console.error("Failed to fetch published portfolio with agent id", error);
    return null;
  }
}

export async function getPortfolioWithAgentByAgentId(agentId: string) {
  try {
    const [row] = await db
      .select({
        id: portfolios.id,
        userId: portfolios.userId,
        handle: portfolios.handle,
        template: portfolios.template,
        content: portfolios.content,
        isPublished: portfolios.isPublished,
        agentId: agents.id,
        agentIsEnabled: agents.isEnabled,
        agentModel: agents.model,
        agentBehaviorType: agents.behaviorType,
        agentStrategyMode: agents.strategyMode,
        agentCustomPrompt: agents.customPrompt,
        agentTemperature: agents.temperature,
      })
      .from(portfolios)
      .innerJoin(agents, eq(agents.portfolioId, portfolios.id))
      .where(eq(agents.id, agentId))
      .limit(1);
    return row ?? null;
  } catch (error) {
    console.error("Failed to fetch portfolio with agent id", error);
    return null;
  }
}

export async function createPortfolio(input: CreatePortfolioInput) {
  try {
    const firstName = input.onboardingData.name?.split(" ")[0];
    const portfolioName =
      input.name ?? (firstName ? `${firstName}'s Portfolio` : "My Portfolio");

    const [created] = await db
      .insert(portfolios)
      .values({
        id: crypto.randomUUID(),
        userId: input.userId,
        name: portfolioName,
        handle: input.handle,
        subdomain: null,
        onboardingData: input.onboardingData,
        template: "modern",
        theme: "minimal",
        isPublished: false,
        content: null,
        updatedAt: new Date(),
      })
      .returning({ id: portfolios.id });

    return { ok: true as const, portfolioId: created.id };
  } catch (error) {
    console.error("Failed to create portfolio", error);
    return { ok: false as const, reason: "db_error" as const };
  }
}

export async function deletePortfolioById(portfolioId: string, userId: string) {
  try {
    await db
      .delete(portfolios)
      .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)));
    return { ok: true as const };
  } catch (error) {
    console.error("Failed to delete portfolio", error);
    return { ok: false as const };
  }
}

/** @deprecated Use deletePortfolioById instead */
export async function deletePortfolioByUserId(userId: string) {
  try {
    await db.delete(portfolios).where(eq(portfolios.userId, userId));
    return { ok: true as const };
  } catch (error) {
    console.error("Failed to delete portfolio", error);
    return { ok: false as const };
  }
}
