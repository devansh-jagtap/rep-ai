"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { portfolios, agents } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getActivePortfolio } from "@/lib/active-portfolio";
import { getAgentByPortfolioId, configureAgentForPortfolio, type ConfigureAgentInput } from "@/lib/agent/configure";
import { generatePortfolio } from "@/lib/ai/generate-portfolio";
import { validateHandle } from "@/lib/validation/handle";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getDashboardData() {
  const userId = await requireAuth();

  const portfolio = await getActivePortfolio(userId);
  if (!portfolio) return null;

  const agent = await getAgentByPortfolioId(portfolio.id);

  return { portfolio, agent };
}
export async function togglePublish(publish: boolean) {
  const userId = await requireAuth();
  const portfolio = await getActivePortfolio(userId);
  if (!portfolio) throw new Error("Portfolio not found");

  if (publish) {
    if (!portfolio.content) throw new Error("Generate portfolio content first");
    await db.update(portfolios).set({
      isPublished: true,
      updatedAt: new Date(),
    }).where(eq(portfolios.id, portfolio.id));
  } else {
    await db.update(portfolios).set({
      isPublished: false,
      updatedAt: new Date(),
    }).where(eq(portfolios.id, portfolio.id));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/portfolio");
}

export async function updateTemplate(template: string) {
  const userId = await requireAuth();
  const portfolio = await getActivePortfolio(userId);
  if (!portfolio) throw new Error("Portfolio not found");

  await db.update(portfolios).set({
    template,
    updatedAt: new Date(),
  }).where(eq(portfolios.id, portfolio.id));

  revalidatePath("/dashboard/portfolio");
}

export async function regeneratePortfolio() {
  const userId = await requireAuth();
  const portfolio = await getActivePortfolio(userId);
  if (!portfolio) throw new Error("Portfolio not found");

  await generatePortfolio(userId, portfolio.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/portfolio");
}

export async function saveAgentConfig(input: ConfigureAgentInput) {
  const userId = await requireAuth();
  const portfolio = await getActivePortfolio(userId);
  if (!portfolio) throw new Error("Portfolio not found");

  const result = await configureAgentForPortfolio(portfolio.id, input);

  if (!result.ok) {
    throw new Error(result.error);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agent");
}

export async function updateHandle(newHandle: string) {
  const userId = await requireAuth();
  const portfolio = await getActivePortfolio(userId);
  if (!portfolio) throw new Error("Portfolio not found");

  const validation = validateHandle(newHandle);
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const [existing] = await db.select({ id: portfolios.id })
    .from(portfolios)
    .where(eq(portfolios.handle, validation.value))
    .limit(1);

  if (existing && existing.id !== portfolio.id) {
    throw new Error("This handle is already taken");
  }

  await db.update(portfolios).set({
    handle: validation.value,
    updatedAt: new Date(),
  }).where(eq(portfolios.id, portfolio.id));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}

export async function updatePortfolioName(name: string) {
  const userId = await requireAuth();
  const portfolio = await getActivePortfolio(userId);
  if (!portfolio) throw new Error("Portfolio not found");

  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 80) throw new Error("Invalid portfolio name");

  await db.update(portfolios).set({
    name: trimmed,
    updatedAt: new Date(),
  }).where(eq(portfolios.id, portfolio.id));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}
