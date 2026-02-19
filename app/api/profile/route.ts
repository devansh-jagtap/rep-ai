import { NextResponse } from "next/server";
import { getProfileById } from "@/lib/db";

export async function GET() {
  const profile = await getProfileById("demo-user");
  return NextResponse.json({ profile });
}
