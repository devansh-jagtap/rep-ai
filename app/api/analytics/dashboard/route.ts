import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/route-helpers";
import { getAnalyticsSummary, getDailyAnalytics } from "@/lib/db/analytics";
import { getActivePortfolio } from "@/lib/active-portfolio";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authResult = await requireUserId();
  if (!authResult.ok) {
    return authResult.response;
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "7d";

  let startDate: Date;
  const endDate = new Date();

  switch (period) {
    case "24h":
      startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      break;
    case "7d":
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }

  const portfolio = await getActivePortfolio(authResult.userId);
  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const [summary, daily] = await Promise.all([
    getAnalyticsSummary({ portfolioId: portfolio.id, startDate, endDate }),
    getDailyAnalytics({ portfolioId: portfolio.id, startDate, endDate }),
  ]);

  return NextResponse.json({ summary, daily, period }, {
    headers: {
      "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
    },
  });
}
