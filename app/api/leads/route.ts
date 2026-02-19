import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveLead, getLeads } from "@/lib/db";
import { extractLeadFromText } from "@/lib/lead-extract";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await getLeads(userId);
  return NextResponse.json({ leads });
}

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

  const text = String(
    body && typeof body === "object" && "text" in body
      ? (body as { text?: unknown }).text ?? ""
      : ""
  );

  if (!checkRateLimit(`leads:${userId}`)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  const lead = extractLeadFromText(text);

  if (!lead.email) {
    return NextResponse.json({ error: "No email found" }, { status: 400 });
  }

  await saveLead({ ...lead, email: lead.email }, userId);
  return NextResponse.json({ lead }, { status: 201 });
}
