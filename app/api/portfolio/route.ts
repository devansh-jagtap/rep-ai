import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deletePortfolioByUserId } from "@/lib/db/portfolio";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { onboardingDrafts } from "@/lib/schema";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.delete(onboardingDrafts).where(eq(onboardingDrafts.userId, session.user.id));
    const result = await deletePortfolioByUserId(session.user.id);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: "Failed to delete portfolio" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to reset onboarding", error);
    return NextResponse.json({ ok: false, error: "Failed to reset" }, { status: 500 });
  }
}
