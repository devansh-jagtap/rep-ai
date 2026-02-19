import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolios } from "@/lib/schema";

export type PortfolioTone = "Professional" | "Friendly" | "Bold" | "Minimal";

export interface PortfolioProjectInput {
  title: string;
  description: string;
}

export interface PortfolioOnboardingData {
  name: string;
  title: string;
  bio: string;
  services: string[];
  projects: PortfolioProjectInput[];
  tone: PortfolioTone;
}

export interface CreatePortfolioInput {
  userId: string;
  handle: string;
  onboardingData: PortfolioOnboardingData;
}

export async function getPortfolioByUserId(userId: string) {
  try {
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .limit(1);

    return portfolio ?? null;
  } catch (error) {
    console.error("Failed to fetch portfolio by user id", error);
    return null;
  }
}

export async function getPortfolioByHandle(handle: string) {
  try {
    const [portfolio] = await db
      .select({ id: portfolios.id })
      .from(portfolios)
      .where(eq(portfolios.handle, handle))
      .limit(1);

    return portfolio ?? null;
  } catch (error) {
    console.error("Failed to fetch portfolio by handle", error);
    return null;
  }
}

export async function createPortfolio(input: CreatePortfolioInput) {
  try {
    const [existing] = await db
      .select({ id: portfolios.id })
      .from(portfolios)
      .where(eq(portfolios.userId, input.userId))
      .limit(1);

    if (existing) {
      return { ok: false as const, reason: "exists" as const };
    }

    await db.insert(portfolios).values({
      id: crypto.randomUUID(),
      userId: input.userId,
      handle: input.handle,
      subdomain: null,
      onboardingData: input.onboardingData,
      theme: "minimal",
      isPublished: false,
      content: null,
      updatedAt: new Date(),
    });

    return { ok: true as const };
  } catch (error) {
    console.error("Failed to create portfolio", error);
    return { ok: false as const, reason: "db_error" as const };
  }
}
