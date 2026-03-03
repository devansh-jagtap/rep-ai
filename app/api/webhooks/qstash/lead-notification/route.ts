import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { db } from "@/lib/db";
import { agentLeads, agents, portfolios, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { sendLeadNotificationEmail } from "@/lib/mail";
import { scheduleLeadNotification } from "@/lib/ai/qstash-notifier";

const INACTIVITY_WINDOW_MS = 5 * 1000; // 5 seconds for rapid testing
const RETRY_DELAY_SECONDS = 10;
const MAX_RETRY_ATTEMPTS = 6;

const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: NextRequest) {
    console.log("[QStash Webhook] Received request at", new Date().toISOString());
    // 1. Verify Signature (Security)
    const signature = req.headers.get("upstash-signature");
    if (!signature) {
        console.error("[QStash Webhook] ❌ Error: Missing upstash-signature header");
        return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const rawBody = await req.text();

    const isDev = process.env.NODE_ENV === "development";
    const sigPrefix = process.env.QSTASH_CURRENT_SIGNING_KEY?.startsWith("sig_local");
    const skipVerification = isDev && (sigPrefix || signature === "sig_local_bypass");

    let isValid = false;
    if (skipVerification) {
        console.log("[QStash Webhook] 🚧 Bypassing verification (Dev Mode)");
        isValid = true;
    } else {
        console.log("[QStash Webhook] 🛡️ Verifying signature...");
        isValid = await receiver.verify({
            signature,
            body: rawBody,
        }).catch((err) => {
            console.error("[QStash Webhook] ❌ Verification error:", err);
            return false;
        });
    }

    // Final fallback for local dev if keys are not configured correctly
    if (!isValid && isDev) {
        console.warn("[QStash Webhook] Signature verification failed, but allowing request in development mode.");
        isValid = true;
    }

    if (!isValid) {
        console.error("[QStash Webhook] ❌ Error: Signature verification failed. Check your QSTASH_SIGNING_KEYS.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    console.log("[QStash Webhook] ✅ Signature verified successfully");

    // 2. Parse Body
    let sessionId: string;
    let attempt = 0;
    try {
        const body = JSON.parse(rawBody);
        sessionId = body.sessionId;
        attempt = Number(body.attempt ?? 0);
    } catch (e) {
        return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    if (!sessionId) {
        return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // 3. Logic to check if we should actually send the email
    try {
        const [lead] = await db
            .select()
            .from(agentLeads)
            .where(eq(agentLeads.sessionId, sessionId))
            .limit(1);

        if (!lead || lead.notificationSent) {
            return NextResponse.json({ ok: true, status: "already_sent_or_missing" });
        }

        // 4. Check if the conversation has been inactive for at least 4.5 minutes
        // (We use 4.5 to account for slight delays in QStash/execution)
        const now = new Date();
        const lastUpdate = lead.updatedAt || lead.createdAt;
        const diffMs = now.getTime() - lastUpdate.getTime();
        const withinInactivityWindow = diffMs < INACTIVITY_WINDOW_MS;

        if (withinInactivityWindow) {
            console.log(`[QStash Webhook] 🕒 Conversation still active. Updated ${Math.round(diffMs / 1000)}s ago. Threshold is ${Math.round(INACTIVITY_WINDOW_MS / 1000)}s. Attempt ${attempt}/${MAX_RETRY_ATTEMPTS}.`);

            if (attempt >= MAX_RETRY_ATTEMPTS) {
                console.warn(`[QStash Webhook] Reached max retry attempts for session ${sessionId}. Skipping requeue.`);
                return NextResponse.json({ ok: true, status: "max_attempts_reached" });
            }

            await scheduleLeadNotification(sessionId, {
                delaySeconds: RETRY_DELAY_SECONDS,
                attempt: attempt + 1,
            });

            return NextResponse.json({ ok: true, status: "conversation_still_active_requeued", attempt: attempt + 1 });
        }
        console.log(`[QStash Webhook] ✅ Inactivity window reached. Proceeding to send email.`);

        // 5. Build and send the email
        const [agentData] = await db
            .select()
            .from(agents)
            .where(eq(agents.id, lead.agentId))
            .limit(1);

        if (!agentData) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        let sourceName = agentData.displayName || "Agent";
        let emailToUse = agentData.notificationEmail;

        if (lead.portfolioId) {
            const [portfolio] = await db
                .select({ name: portfolios.name })
                .from(portfolios)
                .where(eq(portfolios.id, lead.portfolioId))
                .limit(1);
            if (portfolio) {
                sourceName = portfolio.name;
            }
        }

        if (!emailToUse) {
            const [owner] = await db
                .select({ email: users.email })
                .from(users)
                .where(eq(users.id, agentData.userId))
                .limit(1);
            emailToUse = owner?.email;
        }

        if (emailToUse) {
            console.log(`[QStash Webhook] Found recipient email: ${emailToUse}`);
            console.log(`[QStash Webhook] Calling sendLeadNotificationEmail...`);
            await sendLeadNotificationEmail(
                emailToUse,
                {
                    name: lead.name,
                    email: lead.email,
                    phone: lead.phone,
                    website: lead.website,
                    budget: lead.budget,
                    projectDetails: lead.projectDetails,
                    meetingTime: lead.meetingTime,
                },
                sourceName
            );

            // 6. Mark as sent
            await db
                .update(agentLeads)
                .set({ notificationSent: true })
                .where(eq(agentLeads.id, lead.id));

            console.log(`[QStash Webhook] Notification sent and marked in DB for session: ${sessionId}`);
            return NextResponse.json({ ok: true, status: "notified" });
        }

        console.warn(`[QStash Webhook] No recipient email found for session: ${sessionId}`);
        return NextResponse.json({ error: "No recipient email" }, { status: 400 });
    } catch (error) {
        console.error("[QStash Webhook Error]:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
