import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolios } from "@/lib/schema";
import { requireUserId } from "@/lib/api/route-helpers";
import { getActivePortfolio } from "@/lib/active-portfolio";

export async function POST() {
  const authResult = await requireUserId();
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const portfolio = await getActivePortfolio(authResult.userId);
    if (!portfolio) {
      return NextResponse.json({ ok: false, error: "Portfolio not found" }, { status: 404 });
    }

    await db
      .update(portfolios)
      .set({ isPublished: false, updatedAt: new Date() })
      .where(eq(portfolios.id, portfolio.id));

    return NextResponse.json({ ok: true, message: "Portfolio unpublished" });
  } catch (error) {
    console.error("Failed to unpublish portfolio", error);
    return NextResponse.json(
      { ok: false, error: "Failed to unpublish portfolio" },
      { status: 500 }
    );
  }
}
