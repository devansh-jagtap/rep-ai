import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { getAgentByUserId } from "@/lib/agent/configure";
import {
  exchangeCodeForTokens,
  getCurrentUserEmail,
  updateAgentCalendarConnection,
} from "@/lib/integrations/google-calendar";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  console.log("OAuth Callback Hit:", {
    fullUrl: request.url,
    hasCode: !!code,
    error: error
  });

  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL(`/dashboard/agent?calendar_error=${error}`, request.url));
  }

  if (!code) {
    console.error("No code provided in callback");
    return NextResponse.redirect(new URL("/dashboard/agent?calendar_error=missing_code", request.url));
  }

  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/auth/signin?redirect=/dashboard/agent", request.url));
  }

  try {
    const { origin } = new URL(request.url);
    const tokens = await exchangeCodeForTokens(code, origin);
    const accountEmail = await getCurrentUserEmail(tokens.access_token);

    const agent = await getAgentByUserId(session.user.id);

    if (!agent) {
      return NextResponse.redirect(new URL("/dashboard/agent?calendar_error=no_agent", request.url));
    }

    await updateAgentCalendarConnection(agent.id, tokens, accountEmail);

    return NextResponse.redirect(new URL("/dashboard/agent?calendar=connected", request.url));
  } catch (err) {
    console.error("Google Calendar OAuth error:", err);
    return NextResponse.redirect(new URL("/dashboard/agent?calendar_error=auth_failed", request.url));
  }
}
