import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/lib/integrations/google-calendar";

const OAUTH_STATE_COOKIE = "google_oauth_state";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const { origin } = new URL(request.url);

  if (!clientId) {
    return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 });
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(getGoogleOAuthUrl(state, origin));

  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });

  return response;
}
