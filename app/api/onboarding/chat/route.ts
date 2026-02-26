import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { streamOnboardingChat } from "@/lib/ai/onboarding-agent";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { onboardingDrafts } from "@/lib/schema";
import { withDefaultSelectedSections, type OnboardingData } from "@/lib/onboarding/types";
import type { UIMessage } from "ai";

export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messages = (body.messages ?? body.data ?? []) as UIMessage[];
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Messages are required", received: Object.keys(body) },
      { status: 400 }
    );
  }

  let collected: Partial<OnboardingData> = {};
  try {
      const [draft] = await db
      .select()
      .from(onboardingDrafts)
      .where(eq(onboardingDrafts.userId, session.user.id))
      .limit(1);

    collected = withDefaultSelectedSections((draft?.state as Partial<OnboardingData>) ?? {}) ?? {};
  } catch (dbError) {
    console.error("Onboarding draft fetch error (table may not exist):", dbError);
  }

  try {
    const result = await streamOnboardingChat({
      userId: session.user.id,
      messages,
      collected,
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      headers: {
        "Transfer-Encoding": "chunked",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Onboarding chat error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", details: message },
      { status: 500 }
    );
  }
}
