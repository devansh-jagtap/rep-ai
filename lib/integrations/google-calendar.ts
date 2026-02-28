import { db } from "@/lib/db";
import { agents } from "@/lib/schema";
import { decrypt, encrypt } from "@/lib/crypto";
import { eq } from "drizzle-orm";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

const getRedirectUri = (origin?: string) => {
  const base = (origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/api/integrations/google-calendar/callback`;
};

export function getGoogleOAuthUrl(state: string, origin?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const redirectUri = getRedirectUri(origin);

  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email"
  ];

  return `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(state)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes.join(" "))}` +
    `&access_type=offline` +
    `&prompt=consent`;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  attendees?: { email: string }[];
}

export async function exchangeCodeForTokens(code: string, origin?: string): Promise<GoogleTokens> {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const redirectUri = getRedirectUri(origin);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh access token: ${error}`);
  }

  return response.json();
}

export async function getCalendarEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string
): Promise<{ items: GoogleCalendarEvent[] }> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get calendar events: ${error}`);
  }

  return response.json();
}

export async function createCalendarEvent(
  accessToken: string,
  event: GoogleCalendarEvent
): Promise<GoogleCalendarEvent> {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create calendar event: ${error}`);
  }

  return response.json();
}

export async function getCurrentUserEmail(accessToken: string): Promise<string> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to get user info: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data.email;
}

export async function updateAgentCalendarConnection(
  agentId: string,
  tokens: GoogleTokens,
  accountEmail: string
) {
  const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

  await db
    .update(agents)
    .set({
      googleCalendarEnabled: true,
      googleCalendarAccessToken: encrypt(tokens.access_token),
      googleCalendarRefreshToken: encrypt(tokens.refresh_token),
      googleCalendarTokenExpiry: tokenExpiry,
      googleCalendarAccountEmail: accountEmail,
      updatedAt: new Date(),
    })
    .where(eq(agents.id, agentId));
}

export async function disconnectAgentCalendar(agentId: string) {
  await db
    .update(agents)
    .set({
      googleCalendarEnabled: false,
      googleCalendarAccessToken: null,
      googleCalendarRefreshToken: null,
      googleCalendarTokenExpiry: null,
      googleCalendarAccountEmail: null,
      updatedAt: new Date(),
    })
    .where(eq(agents.id, agentId));
}

export async function getValidAccessToken(agent: typeof agents.$inferSelect): Promise<string | null> {
  if (!agent.googleCalendarEnabled || !agent.googleCalendarAccessToken) {
    return null;
  }

  let accessToken: string;
  try {
    accessToken = decrypt(agent.googleCalendarAccessToken);
  } catch (error) {
    console.error("Failed to decrypt Google Calendar access token:", error);
    return null;
  }

  if (
    agent.googleCalendarTokenExpiry &&
    new Date(agent.googleCalendarTokenExpiry) > new Date(Date.now() + 5 * 60 * 1000)
  ) {
    return accessToken;
  }

  if (!agent.googleCalendarRefreshToken) {
    return null;
  }

  let refreshToken: string;
  try {
    refreshToken = decrypt(agent.googleCalendarRefreshToken);
  } catch (error) {
    console.error("Failed to decrypt Google Calendar refresh token:", error);
    return null;
  }

  try {
    const tokens = await refreshAccessToken(refreshToken);
    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    await db
      .update(agents)
      .set({
        googleCalendarAccessToken: encrypt(tokens.access_token),
        ...(tokens.refresh_token && { googleCalendarRefreshToken: encrypt(tokens.refresh_token) }),
        googleCalendarTokenExpiry: tokenExpiry,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agent.id));

    return tokens.access_token;
  } catch (error) {
    console.error("Failed to refresh Google Calendar token:", error);
    return null;
  }
}
