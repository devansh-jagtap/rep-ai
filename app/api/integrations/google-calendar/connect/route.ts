import { NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/lib/integrations/google-calendar";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const { origin } = new URL(request.url);

  if (!clientId) {
    return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 });
  }

  return NextResponse.redirect(getGoogleOAuthUrl(origin));
}
