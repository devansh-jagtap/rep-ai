import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { onboardingDrafts } from "@/lib/schema";
import type { OnboardingData } from "@/lib/onboarding/types";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [draft] = await db
      .select()
      .from(onboardingDrafts)
      .where(eq(onboardingDrafts.userId, session.user.id))
      .limit(1);

    const state = (draft?.state as Partial<OnboardingData>) ?? null;
    return NextResponse.json({ ok: true, state });
  } catch (error) {
    console.error("Failed to fetch onboarding draft", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch draft" }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.delete(onboardingDrafts).where(eq(onboardingDrafts.userId, session.user.id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to clear onboarding draft", error);
    return NextResponse.json({ ok: false, error: "Failed to clear draft" }, { status: 500 });
  }
}
