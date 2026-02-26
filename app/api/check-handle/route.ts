import { NextResponse } from "next/server";
import { isHandleAvailable } from "@/lib/db/portfolio";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle");

  if (!handle || handle.length < 3 || handle.length > 30) {
    return NextResponse.json(
      { available: false, error: "Handle must be 3-30 characters" },
      { status: 400 }
    );
  }

  if (!/^[a-z0-9-]+$/.test(handle)) {
    return NextResponse.json(
      { available: false, error: "Only lowercase letters, numbers, and hyphens allowed" },
      { status: 400 }
    );
  }

  const available = await isHandleAvailable(handle);
  return NextResponse.json({ available });
}
