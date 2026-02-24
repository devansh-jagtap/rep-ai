import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string; name?: string }
    | null;

  const email = String(body?.email ?? "").toLowerCase().trim();
  const password = String(body?.password ?? "");
  const name = String(body?.name ?? "").trim() || null;

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Email and password (min 8 chars) are required." },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
  }

  await db.insert(users).values({
    id: crypto.randomUUID(),
    email,
    name,
    passwordHash: await hash(password, 12),
    plan: "free",
    credits: 500,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
