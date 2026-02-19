import { NextResponse } from "next/server";
import { generateChatReply } from "@/lib/ai";
import { consumeCredits } from "@/lib/credits";
import { parseJsonBody, requireUserId } from "@/lib/api/route-helpers";
import { checkRateLimit } from "@/lib/rate-limit";

interface ChatRequestBody {
  prompt?: unknown;
}

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

  if (!(await consumeCredits(authResult.userId, 1))) {
    return NextResponse.json({ error: "Not enough credits" }, { status: 402 });
  }

  const reply = await generateChatReply(prompt);
  return NextResponse.json({ reply });
}
