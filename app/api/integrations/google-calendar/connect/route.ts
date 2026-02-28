import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/lib/integrations/google-calendar";

import { canUseCalendar } from "@/lib/billing";
import { requireUserId } from "@/lib/api/route-helpers";

const OAUTH_STATE_COOKIE = "google_oauth_state";

export async function GET(request: Request) {
  const authResult = await requireUserId();
  if (!authResult.ok) {
    return authResult.response;
  }

  const allowed = await canUseCalendar(authResult.userId);
  if (!allowed) {
    return NextResponse.json(
      { error: "Google Calendar integration requires a Pro plan." },
      { status: 403 }
    );
  }

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
