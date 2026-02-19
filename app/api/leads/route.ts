import { NextResponse } from "next/server";
import { saveLead } from "@/lib/db";
import { extractLeadFromText } from "@/lib/lead-extract";

export async function POST(request: Request) {
  const body = await request.json();
  const text = String(body?.text ?? "");
  const lead = extractLeadFromText(text);

  if (!lead.email) {
    return NextResponse.json({ error: "No email found" }, { status: 400 });
  }

  await saveLead(lead);
  return NextResponse.json({ lead }, { status: 201 });
}
