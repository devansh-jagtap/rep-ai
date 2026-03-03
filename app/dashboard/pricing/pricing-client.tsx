"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const PLANS = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        description: "Perfect for students and job seekers looking to stand out.",
        features: [
            "1 AI Portfolio",
            "1 AI Agent Clone",
            "150 AI messages/month",
            "5 lead captures/month",
            "Standard templates",
        ],
        buttonText: "Upgrade to Free",
    },
    {
        id: "pro",
        name: "Pro",
        price: "$24",
        description: "For freelancers and creators scaling their pipeline.",
        features: [
            "3 AI Portfolios",
            "3 AI Agents",
            "2,000 AI messages/month",
            "Unlimited lead captures",
            "Google Calendar integration",
            "Custom domain",
        ],
        buttonText: "Upgrade to Pro",
        highlight: true,
    },
    {
        id: "business",
        name: "Agency",
        price: "$79",
        description: "Built for agencies and consultants managing multiple brands.",
        features: [
            "10 AI Portfolios",
            "10 AI Agents",
            "15,000 AI messages/month",
            "Everything in Pro",
            "Priority support",
        ],
        buttonText: "Go Agency",
    },
];

export function PricingClient({ currentPlan }: { currentPlan: string }) {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleUpgrade = async (planId: string) => {
        if (planId === currentPlan) return;

        setLoadingPlan(planId);
        try {
            const response = await fetch("/api/billing/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: planId }),
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.error || "Failed to start checkout");
            }
        } catch {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl tracking-tight sm:text-5xl mb-4">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Choose the plan that&apos;s right for your career or business.
                    Upgrade or downgrade at any time.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {PLANS.map((plan) => {
                    const isActive = currentPlan === plan.id;
                    return (
                        <Card
                            key={plan.id}
                            className={`flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl ${plan.highlight ? "border-primary shadow-lg scale-105" : "border-border"
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute top-0 right-0">
                                    <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground font-bold py-1 px-3">
                                        MOST POPULAR
                                    </Badge>
                                </div>
                            )}

                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center font-light gap-2 font-serif">
                                    {plan.name}
                                </CardTitle>
                                <CardDescription className="min-h-[48px]">{plan.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    {plan.id !== "free" && <span className="text-muted-foreground ml-1">/month</span>}
                                </div>

                                <ul className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-sm">
                                            <Check className="size-4 text-primary shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    className={`w-full font-bold h-11 ${plan.highlight ? "" : "variant-outline"}`}
                                    variant={plan.highlight ? "default" : "outline"}
                                    disabled={loadingPlan !== null || isActive || (plan.id === "free" && currentPlan !== "free")}
                                    onClick={() => handleUpgrade(plan.id)}
                                >
                                    {loadingPlan === plan.id ? (
                                        <Loader2 className="size-4 animate-spin mr-2" />
                                    ) : null}
                                    {isActive ? "Active Plan" : plan.buttonText}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-16 text-center space-y-4">
                <h2 className="text-2xl">Frequently Asked Questions</h2>
                <div className="grid gap-8 md:grid-cols-2 text-left max-w-4xl mx-auto py-8">
                    <div className="space-y-2">
                        <h3 className="">Can I use my own domain?</h3>
                        <p className="text-sm text-muted-foreground">Yes! Our Pro and Agency plans allow you to connect a custom domain to your portfolio easily.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="">What counts as an &quot;AI message&quot;?</h3>
                        <p className="text-sm text-muted-foreground">Any time a visitor chats with your AI agent, it counts as one message. Testing the chat in your dashboard is also included in your limits.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="">Is there a long-term commitment?</h3>
                        <p className="text-sm text-muted-foreground">No, all plans are month-to-month and you can cancel anytime from your settings.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="">Does the AI collect secure payment info?</h3>
                        <p className="text-sm text-muted-foreground">No, our AI is trained to handle conversation and scheduling. Payments for your services should be handled via traditional links you provide or integrate.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
