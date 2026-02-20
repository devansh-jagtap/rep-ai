import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { portfolios } from "@/lib/schema";
import { requireUserId } from "@/lib/api/route-helpers";

export async function POST() {
  const authResult = await requireUserId();
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const [portfolio] = await db
      .select({ id: portfolios.id, content: portfolios.content })
      .from(portfolios)
      .where(eq(portfolios.userId, authResult.userId))
      .limit(1);

    if (!portfolio) {
      return NextResponse.json(
        { ok: false, error: "Portfolio not found" },
        { status: 404 }
      );
    }

    if (!portfolio.content) {
      return NextResponse.json(
        { ok: false, error: "Generate portfolio first" },
        { status: 400 }
      );
    }

    await db
      .update(portfolios)
      .set({ isPublished: true, updatedAt: new Date() })
      .where(eq(portfolios.id, portfolio.id));

    return NextResponse.json({ ok: true, message: "Portfolio published" });
  } catch (error) {
    console.error("Failed to publish portfolio", error);
    return NextResponse.json(
      { ok: false, error: "Failed to publish portfolio" },
      { status: 500 }
    );
  }
}
