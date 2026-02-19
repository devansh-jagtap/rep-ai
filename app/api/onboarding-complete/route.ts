import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPortfolio, getPortfolioByHandle } from "@/lib/db/portfolio";
import type { OnboardingData } from "@/lib/onboarding/types";
import { validateFinalOnboardingState } from "@/lib/onboarding/validation";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { state?: Partial<OnboardingData> };
  try {
    body = (await request.json()) as { state?: Partial<OnboardingData> };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = validateFinalOnboardingState(body.state ?? {});
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.message }, { status: 400 });
  }

  const finalState = parsed.value;

  try {
    const taken = await getPortfolioByHandle(finalState.handle);
    if (taken) {
      return NextResponse.json(
        { ok: false, error: "This handle is already taken. Please choose another one." },
        { status: 409 }
      );
    }

    const created = await createPortfolio({
      userId: session.user.id,
      handle: finalState.handle,
      onboardingData: finalState,
    });

    if (!created.ok && created.reason === "exists") {
      return NextResponse.json({ ok: true, redirectTo: "/dashboard" });
    }

    if (!created.ok) {
      return NextResponse.json(
        { ok: false, error: "Unable to save onboarding data right now." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, redirectTo: "/dashboard/preview" });
  } catch (error) {
    console.error("Failed to complete onboarding", error);
    return NextResponse.json({ ok: false, error: "Unable to complete onboarding right now." }, { status: 500 });
  }
}
