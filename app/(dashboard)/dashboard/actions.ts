"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { portfolios, agents } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getPortfolioByUserId } from "@/lib/db/portfolio";
import { configureAgentForUser, getAgentByPortfolioId, type ConfigureAgentInput } from "@/lib/agent/configure";
import { generatePortfolio } from "@/lib/ai/generate-portfolio";
import { validateHandle } from "@/lib/validation/handle";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getDashboardData() {
  const userId = await requireAuth();

  const portfolio = await getPortfolioByUserId(userId);
  if (!portfolio) return null;

  const agent = await getAgentByPortfolioId(portfolio.id);

  return { portfolio, agent };
}

export async function togglePublish(publish: boolean) {
  const userId = await requireAuth();

  if (publish) {
    const portfolio = await getPortfolioByUserId(userId);
    if (!portfolio) throw new Error("Portfolio not found");
    if (!portfolio.content) throw new Error("Generate portfolio content first");

    await db.update(portfolios).set({
      isPublished: true,
      updatedAt: new Date(),
    }).where(eq(portfolios.id, portfolio.id));
  } else {
    await db.update(portfolios).set({
      isPublished: false,
      updatedAt: new Date(),
    }).where(eq(portfolios.userId, userId));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/portfolio");
}

export async function updateTemplate(template: string) {
  const userId = await requireAuth();
  const portfolio = await getPortfolioByUserId(userId);
  if (!portfolio) throw new Error("Portfolio not found");

  await db.update(portfolios).set({
    template,
    updatedAt: new Date(),
  }).where(eq(portfolios.id, portfolio.id));

  revalidatePath("/dashboard/portfolio");
}

export async function regeneratePortfolio() {
  const userId = await requireAuth();
  const portfolio = await getPortfolioByUserId(userId);
  if (!portfolio) throw new Error("Portfolio not found");

  await generatePortfolio(userId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/portfolio");
}

export async function saveAgentConfig(input: ConfigureAgentInput) {
  const userId = await requireAuth();
  const result = await configureAgentForUser(userId, input);

  if (!result.ok) {
    throw new Error(result.error);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agent");
}

export async function updateHandle(newHandle: string) {
  const userId = await requireAuth();
  const portfolio = await getPortfolioByUserId(userId);
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
