import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/route-helpers";
import { getAgentByUserId } from "@/lib/agent/configure";
import { disconnectAgentCalendar } from "@/lib/integrations/google-calendar";

export async function POST() {
  const authResult = await requireUserId();
  if (!authResult.ok) {
    return authResult.response;
  }

  const agent = await getAgentByUserId(authResult.userId);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  await disconnectAgentCalendar(agent.id);

  return NextResponse.json({ success: true });
}
