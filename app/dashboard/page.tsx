import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Bot, Users, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/dashboard/copy-button";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "./actions";
import { db } from "@/lib/db";
import { agentLeads } from "@/lib/schema";
import { eq, count, gte, and } from "drizzle-orm";
import { getProfileById } from "@/lib/db";

const MODEL_LABELS: Record<string, string> = {
  "moonshotai/Kimi-K2.5": "Kimi K2.5",
  "MiniMaxAI/MiniMax-M2.1": "MiniMax M2.1",
  "zai-org/GLM-4.7-FP8": "GLM 4.7",
  "openai/gpt-oss-120b": "GPT-OSS 120B",
};

export default async function OverviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const [data, profile] = await Promise.all([
    getDashboardData(),
    getProfileById(session.user.id),
  ]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">No Portfolio Found</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          You need to complete onboarding first to set up your portfolio and AI agent.
        </p>
        <Button asChild>
          <Link href="/onboarding">Start Onboarding</Link>
        </Button>
      </div>
    );
  }

  const { portfolio, agent } = data;

  const [totalLeadsResult] = await db
    .select({ count: count() })
    .from(agentLeads)
    .where(eq(agentLeads.portfolioId, portfolio.id));

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [newLeadsResult] = await db
    .select({ count: count() })
    .from(agentLeads)
    .where(
      and(
        eq(agentLeads.portfolioId, portfolio.id),
        gte(agentLeads.createdAt, sevenDaysAgo)
      )
    );

  const totalLeads = totalLeadsResult.count;
  const newLeads = newLeadsResult.count;
  const hasContent = !!portfolio.content;
  const modelLabel = agent ? MODEL_LABELS[agent.model] || agent.model : "Not configured";
  const portfolioLink = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/${portfolio.handle}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Welcome back, {profile?.name || session.user.name || "there"}! Here's your dashboard at a glance.
        </p>
      </div>

      {/* Warning banners */}
      {!hasContent && (
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 flex items-start gap-3">
          <Sparkles className="size-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Portfolio content not generated yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Head to the Portfolio page to generate your content with AI before publishing.
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/dashboard/portfolio">Generate Content</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
            <Briefcase className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolio.isPublished ? (
                <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Template: <span className="capitalize">{portfolio.template}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Agent</CardTitle>
            <Bot className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {agent?.isEnabled ? (
                <Badge className="bg-blue-500 text-white hover:bg-blue-600">Enabled</Badge>
              ) : (
                <Badge variant="outline">Disabled</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Model: {modelLabel}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Captured by your AI agent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads (7d)</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newLeads}</div>
            <p className="text-xs text-muted-foreground mt-2">
              In the past week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agent info */}
      {agent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="size-5" />
              Agent Configuration
            </CardTitle>
            <CardDescription>Current AI agent settings at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Model</p>
                <p className="text-sm font-medium">{modelLabel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Behavior</p>
                <p className="text-sm font-medium capitalize">{agent.behaviorType || "Custom"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Temperature</p>
                <p className="text-sm font-medium">{agent.temperature.toFixed(1)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-medium">{agent.isEnabled ? "Active" : "Disabled"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Public Portfolio</CardTitle>
            <CardDescription>Share your portfolio link with prospects</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <div className="flex-1 bg-muted px-3 py-2 rounded-md text-sm truncate font-mono">
              {portfolioLink}
            </div>
            <CopyButton text={portfolioLink} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to key sections</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" className="justify-between" asChild>
              <Link href="/dashboard/portfolio">
                <span>Edit Portfolio</span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <Link href="/dashboard/agent">
                <span>Configure Agent</span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <Link href="/dashboard/leads">
                <span>View Leads</span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
