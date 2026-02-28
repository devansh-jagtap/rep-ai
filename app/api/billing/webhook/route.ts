import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Note: In a real app, use @dodopayments/nextjs webhook handler for signature verification
// For now, setting up the logic structure.

export async function POST(request: Request) {
    const payload = await request.json();
    const eventType = payload.type;

    try {
        if (eventType === "subscription.created" || eventType === "subscription.updated") {
            const { metadata, id, customer_id } = payload.data;
            const userId = metadata?.userId;
            const plan = metadata?.plan;

            if (userId && plan) {
                await db.update(users)
                    .set({
                        plan: plan,
                        billingSubscriptionId: id,
                        billingCustomerId: customer_id,
                    })
                    .where(eq(users.id, userId));
            }
        }

        if (eventType === "subscription.cancelled") {
            const { id } = payload.data;
            await db.update(users)
                .set({
                    plan: "free",
                    billingSubscriptionId: null,
                })
                .where(eq(users.billingSubscriptionId, id));
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
