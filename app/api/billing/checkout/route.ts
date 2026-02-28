import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/route-helpers";
import { DodoPayments } from "dodopayments";

const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: "test_mode",
});

export async function POST(request: Request) {
    const authResult = await requireUserId();
    if (!authResult.ok) {
        return authResult.response;
    }

    try {
        const { plan } = await request.json();

        let productId = "";
        if (plan === "pro") {
            productId = process.env.DODO_PRO_PRODUCT_ID!;
        } else if (plan === "business") {
            productId = process.env.DODO_BUSINESS_PRODUCT_ID!;
        } else {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        if (!productId || productId.includes("placeholder")) {
            return NextResponse.json(
                { error: "Billing is not correctly configured. Missing valid Product ID." },
                { status: 400 }
            );
        }

        const session = await dodo.checkoutSessions.create({
            product_cart: [
                {
                    product_id: productId,
                    quantity: 1,
                },
            ],
            customer: {
                email: "customer@example.com", // Should be user's email
            },
            metadata: {
                userId: authResult.userId,
                plan: plan,
            },
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pricing?status=success`,
        });

        return NextResponse.json({ url: session.checkout_url });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }
}
