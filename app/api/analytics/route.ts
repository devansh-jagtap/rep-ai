import { NextResponse } from "next/server";
import { trackAnalytics, getPortfolioIdByHandle, type AnalyticsType } from "@/lib/db/analytics";

interface AnalyticsRequestBody {
  handle: string;
  type: AnalyticsType;
  sessionId?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as AnalyticsRequestBody | null;

    if (!body?.handle || !body?.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validTypes = ["page_view", "chat_session_start", "chat_message"];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const portfolioId = await getPortfolioIdByHandle(body.handle);
    if (!portfolioId) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    const referrer = request.headers.get("referer") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    await trackAnalytics({
      portfolioId,
      type: body.type,
      referrer,
      userAgent,
      sessionId: body.sessionId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
