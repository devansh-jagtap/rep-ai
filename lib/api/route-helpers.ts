import { NextResponse } from "next/server";
import { auth } from "@/auth";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { ok: false as const, response: jsonError("Unauthorized", 401) };
  }

  return { ok: true as const, userId };
}

export async function parseJsonBody<T>(request: Request) {
  try {
    const body = (await request.json()) as T;
    return { ok: true as const, body };
  } catch {
    return {
      ok: false as const,
      response: jsonError("Invalid JSON body", 400),
    };
  }
}
