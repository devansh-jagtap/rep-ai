import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolios } from "@/lib/schema";
import {
  validatePortfolioContent,
  type PortfolioContent,
} from "@/lib/validation/portfolio-schema";

const nebius = createOpenAI({
  apiKey: process.env.NEBIUS_API_KEY,
  baseURL: process.env.NEBIUS_BASE_URL ?? "https://api.studio.nebius.com/v1",
});

const MODEL = "moonshotai/Kimi-K2.5";

const SYSTEM_PROMPT = `You are a portfolio content generation engine.
Generate output as valid JSON only.
Do not use markdown.
Do not include code fences.
Do not include explanations.
Do not include comments.
Do not include any keys other than the required schema.
Use a professional, concise, client-facing tone.
Output must be a single JSON object matching this exact TypeScript shape:
{
  "hero": {
    "headline": string,
    "subheadline": string,
    "ctaText": string
  },
  "about": {
    "paragraph": string
  },
  "services": [
    {
      "title": string,
      "description": string
    }
  ],
  "projects": [
    {
      "title": string,
      "description": string,
      "result": string
    }
  ],
  "cta": {
    "headline": string,
    "subtext": string
  }
}`;

export class PortfolioGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortfolioGenerationError";
  }
}

function tryParsePortfolioContent(text: string): PortfolioContent {
  const trimmed = text.trim();
  const parsed: unknown = JSON.parse(trimmed);
  return validatePortfolioContent(parsed);
}

async function generatePortfolioContent(onboardingData: unknown): Promise<PortfolioContent> {
  const prompt = `Create portfolio content from the onboarding_data below. Return valid JSON only.\n\nonboarding_data:\n${JSON.stringify(onboardingData)}`;

  try {
    const response = await generateText({
      model: nebius.chat(MODEL),
      system: SYSTEM_PROMPT,
      prompt,
      temperature: 0.5,
      maxTokens: 1200,
    });

    try {
      return tryParsePortfolioContent(response.text);
    } catch {
      const retryResponse = await generateText({
        model: nebius.chat(MODEL),
        system: SYSTEM_PROMPT,
        prompt: `${prompt}\n\nYour previous output was invalid JSON. Return only valid JSON matching the exact schema.`,
        temperature: 0.5,
        maxTokens: 1200,
      });

      return tryParsePortfolioContent(retryResponse.text);
    }
  } catch (error) {
    throw new PortfolioGenerationError(
      error instanceof Error ? error.message : "Failed to generate portfolio content"
    );
  }
}

export async function generatePortfolio(userId: string): Promise<void> {
  console.info("[portfolio-generation] start", { userId });

  try {
    const [portfolio] = await db
      .select({
        id: portfolios.id,
        onboardingData: portfolios.onboardingData,
      })
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .limit(1);

    if (!portfolio) {
      throw new PortfolioGenerationError("Portfolio not found");
    }

    const generatedContent = await generatePortfolioContent(portfolio.onboardingData);

    await db
      .update(portfolios)
      .set({
        content: generatedContent,
        updatedAt: new Date(),
      })
      .where(eq(portfolios.id, portfolio.id));

    console.info("[portfolio-generation] success", { userId });
  } catch (error) {
    console.error("[portfolio-generation] failure", {
      userId,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    if (error instanceof PortfolioGenerationError) {
      throw error;
    }

    throw new PortfolioGenerationError("Portfolio generation failed");
  }
}
