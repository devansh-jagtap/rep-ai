import { NextResponse } from "next/server";
import { saveLead } from "@/lib/db";
import { extractLeadFromText } from "@/lib/lead-extract";
import { checkRateLimit } from "@/lib/rate-limit";

function getClientId(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const text = String(
    body && typeof body === "object" && "text" in body
      ? (body as { text?: unknown }).text ?? ""
      : ""
  );

  if (!checkRateLimit(`leads:${getClientId(request)}`)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  const lead = extractLeadFromText(text);

  if (!lead.email) {
    return NextResponse.json({ error: "No email found" }, { status: 400 });
  }

  await saveLead(lead);
  return NextResponse.json({ lead }, { status: 201 });
}
