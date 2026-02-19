import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateChatReply } from "@/lib/ai";
import { consumeCredits } from "@/lib/credits";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const prompt = String(
    body && typeof body === "object" && "prompt" in body
      ? (body as { prompt?: unknown }).prompt ?? ""
      : ""
  );

  if (!checkRateLimit(`chat:${userId}`)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  if (!(await consumeCredits(userId, 1))) {
    return NextResponse.json({ error: "Not enough credits" }, { status: 402 });
  }

  const reply = await generateChatReply(prompt);
  return NextResponse.json({ reply });
}
