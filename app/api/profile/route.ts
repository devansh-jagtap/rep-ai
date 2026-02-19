import { NextResponse } from "next/server";
import { getProfileById } from "@/lib/db";
import { requireUserId } from "@/lib/api/route-helpers";

export async function GET() {
  const authResult = await requireUserId();
  if (!authResult.ok) {
    return authResult.response;
  }

  const profile = await getProfileById(authResult.userId);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}
