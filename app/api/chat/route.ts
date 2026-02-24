import { NextResponse } from "next/server";
import { generateChatReply } from "@/lib/ai";
import { consumeCredits, getCredits } from "@/lib/credits";
import { parseJsonBody, requireUserId } from "@/lib/api/route-helpers";
import { checkRateLimit } from "@/lib/rate-limit";

interface ChatRequestBody {
  prompt?: unknown;
}

const CREDIT_COST = 1;

export async function POST(request: Request) {
  const authResult = await requireUserId();
  if (!authResult.ok) {
    return authResult.response;
  }

  const jsonResult = await parseJsonBody<ChatRequestBody>(request);
  if (!jsonResult.ok) {
    return jsonResult.response;
  }

  const prompt = String(jsonResult.body.prompt ?? "");

  if (!checkRateLimit(`chat:${authResult.userId}`)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const currentCredits = await getCredits(authResult.userId);
  if (currentCredits < CREDIT_COST) {
    return NextResponse.json({ error: "Not enough credits" }, { status: 402 });
  }

  let reply: string;
  try {
    reply = await generateChatReply(prompt);
  } catch {
    return NextResponse.json({ error: "Failed to generate reply" }, { status: 500 });
  }

  const creditsConsumed = await consumeCredits(authResult.userId, CREDIT_COST);
  if (!creditsConsumed) {
    return NextResponse.json({ error: "Not enough credits" }, { status: 402 });
  }

  return NextResponse.json({ reply });
}
