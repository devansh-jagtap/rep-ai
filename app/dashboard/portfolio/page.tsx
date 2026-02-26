import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "../_lib/get-dashboard-data";
import { PortfolioClient } from "./portfolio-client";
import type { PortfolioSectionKey } from "@/lib/portfolio/section-registry";

export default async function PortfolioPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");

  const data = await getDashboardData();
  if (!data) redirect("/onboarding");

  const { portfolio } = data;

  const content = portfolio.content as {
    hero?: { headline?: string; subheadline?: string };
    about?: { paragraph?: string };
    services?: { title: string; description: string }[];
    projects?: { title: string; description: string; result: string }[];
    cta?: { headline?: string; subtext?: string };
    visibleSections?: PortfolioSectionKey[];
  } | null;

  return (
    <PortfolioClient
      portfolio={{
        handle: portfolio.handle,
        isPublished: portfolio.isPublished,
        template: portfolio.template,
        updatedAt: portfolio.updatedAt.toISOString(),
      }}
      content={content}
    />
  );
}
