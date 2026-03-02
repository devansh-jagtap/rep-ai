"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Check, Loader2 } from "lucide-react";

interface BillingTabProps {
    user: {
        plan: string;
        credits: number;
    };
    loadingPlan: string | null;
    handleUpgrade: (planId: string) => void;
}

export function BillingTab({ user, loadingPlan, handleUpgrade }: BillingTabProps) {
    return (
        <div className="space-y-6 pt-4">
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                                <Zap className="size-6" />
                            </div>
                            <Badge variant="secondary" className="capitalize">{user.plan}</Badge>
                        </div>
                        <CardTitle className="text-xl">Plan & Usage</CardTitle>
                        <CardDescription>
                            Your current subscription and credit balance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border border-border">
                            <span className="text-sm font-medium text-muted-foreground">Credits Remaining</span>
                            <span className="text-xl font-bold">{user.credits}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col border-primary/20 bg-primary/5">
                    <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Check className="size-6" />
                            </div>
                            <Badge variant="default" className="bg-primary">Active</Badge>
                        </div>
                        <CardTitle className="text-xl capitalize">{user.plan} Plan</CardTitle>
                        <CardDescription>
                            You are currently on the {user.plan} plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground font-medium">
                            Manage your subscription and billing details via our payment partner.
                        </p>
                    </CardContent>
                    <CardFooter className="bg-primary/5 border-t border-primary/10 mt-auto">
                        <Button variant="outline" className="w-full bg-background" disabled>
                            Manage Subscription
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {[
                    {
                        id: "pro",
                        name: "Pro",
                        price: "$19",
                        description: "Your 24/7 automated sales representative.",
                        features: ["3 AI Portfolios", "3 AI Agents", "1,000 AI Messages / mo", "Google Calendar Integration", "Lead Capture & CRM", "Custom Domain Support"],
                    },
                    {
                        id: "business",
                        name: "Agency",
                        price: "$49",
                        description: "Scale your portfolio business with power metrics.",
                        features: ["10 AI Portfolios", "10 AI Agents", "10,000 AI Messages / mo", "Deep AI Analytics", "Webhook Integrations", "Priority Support"],
                    },
                ].map((plan) => (
                    <Card key={plan.id} className={user.plan === plan.id ? "opacity-60 pointer-events-none" : ""}>
                        <CardHeader>
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <span className="text-3xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground ml-1">/month</span>
                            </div>
                            <ul className="space-y-2">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                        <Check className="size-3 text-primary shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="border-t bg-muted/30">
                            <Button
                                className="w-full"
                                variant={plan.id === "pro" ? "default" : "outline"}
                                disabled={user.plan === plan.id || loadingPlan !== null}
                                onClick={() => handleUpgrade(plan.id)}
                            >
                                {loadingPlan === plan.id ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                                {user.plan === plan.id ? "Current Plan" : `Upgrade to ${plan.name}`}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
