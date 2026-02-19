import { NextResponse } from "next/server";
import { generateChatReply } from "@/lib/ai";
import { consumeCredits } from "@/lib/credits";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = String(body?.prompt ?? "");
  const userId = "demo-user";

  if (!checkRateLimit(`chat:${userId}`)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  if (!consumeCredits(userId, 1)) {
    return NextResponse.json({ error: "Not enough credits" }, { status: 402 });
  }

  const reply = await generateChatReply(prompt);
  return NextResponse.json({ reply });
}
