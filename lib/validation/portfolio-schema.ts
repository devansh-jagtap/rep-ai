import { z } from "zod";

export type SocialPlatform = "twitter" | "linkedin" | "github" | "instagram" | "youtube" | "facebook" | "website";

export type SocialLink = {
  platform: SocialPlatform;
  enabled: boolean;
  url: string;
};

export type PortfolioContent = {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
  };
  about: {
    paragraph: string;
  };
  services: {
    title: string;
    description: string;
  }[];
  projects: {
    title: string;
    description: string;
    result: string;
  }[];
  cta: {
    headline: string;
    subtext: string;
  };
  socialLinks: SocialLink[];
};

const serviceSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
  })
  .strict();

const projectSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    result: z.string().min(1),
  })
  .strict();

const socialLinkSchema = z
  .object({
    platform: z.enum(["twitter", "linkedin", "github", "instagram", "youtube", "facebook", "website"]),
    enabled: z.boolean(),
    url: z.string().url(),
  })
  .strict();

const portfolioContentSchema = z
  .object({
    hero: z
      .object({
        headline: z.string().min(1),
        subheadline: z.string().min(1),
        ctaText: z.string().min(1),
      })
      .strict(),
    about: z
      .object({
        paragraph: z.string().min(1),
      })
      .strict(),
    services: z.array(serviceSchema),
    projects: z.array(projectSchema),
    cta: z
      .object({
        headline: z.string().min(1),
        subtext: z.string().min(1),
      })
      .strict(),
    socialLinks: z.array(socialLinkSchema).default([]),
  })
  .strict();

export function validatePortfolioContent(data: unknown): PortfolioContent {
  const parsed = portfolioContentSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(`Invalid portfolio content: ${parsed.error.issues[0]?.message ?? "unknown error"}`);
  }

  return parsed.data;
}
