import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Bot, Users, Sparkles, AlertCircle, Eye, MessageSquare, BarChart3 } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/dashboard/copy-button";
import { redirect } from "next/navigation";
import { getDashboardOverviewData } from "@/app/(dashboard)/dashboard/_lib/dashboard-overview-service";


export default async function OverviewPage() {
  const overview = await getDashboardOverviewData();
  if (!overview.session?.user?.id) redirect("/auth/signin");

  if (!overview.data) {
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

  const { data, profile, hasContent, modelLabel, newLeads, portfolioLink, totalLeads, analytics7d, session } = overview;
  const { portfolio, agent } = data;

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Overview
        </h1>
        <p className="text-muted-foreground text-lg">
          Welcome back, <span className="font-medium text-foreground">{profile?.name || session.user.name || "there"}!</span> Here&apos;s your dashboard at a glance.
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden group border-muted/60 bg-linear-to-br from-background">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio</CardTitle>
            <div className="p-2 bg-primary/10 rounded-md">
              <Briefcase className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight mt-1">
              {portfolio.isPublished ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 hover:text-emerald-700 border-emerald-500/20 shadow-none">Published</Badge>
              ) : (
                <Badge variant="secondary" className="shadow-none">Draft</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <span>Template:</span>
              <span className="capitalize font-medium text-foreground">{portfolio.template}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-muted/60 bg-linear-to-br from-background">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Agent</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-md">
              <Bot className="size-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mt-1">
              {agent?.isEnabled ? (
                <Badge className="bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 hover:text-blue-700 border-blue-500/20 shadow-none">Enabled</Badge>
              ) : (
                <Badge variant="outline" className="shadow-none">Disabled</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <span>Model:</span>
              <span className="font-medium text-foreground">{modelLabel}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-muted/60 bg-linear-to-br from-background 0">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-md">
              <Users className="size-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight mt-1">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Captured by your AI agent
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-muted/60 bg-linear-to-br from-background 0">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Leads</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-md">
              <Sparkles className="size-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mt-1">
              <div className="text-3xl font-bold tracking-tight">{newLeads}</div>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-muted/50">7d</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              In the past week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Minimal analytics (7d) */}
      <Card className="border-muted/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base font-semibold">Analytics Overview</CardTitle>
            <CardDescription>Performance metrics for the last 7 days</CardDescription>
          </div>
          <div className="p-2 bg-muted/50 rounded-md">
            <BarChart3 className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border rounded-lg p-1 bg-muted/20">
            <div className="flex flex-col items-center justify-center p-4 text-center group transition-colors hover:bg-muted/50 rounded-md">
              <div className="p-2 bg-blue-500/10 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <Eye className="size-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold tracking-tight">{analytics7d.totalPageViews.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Page views</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 text-center group transition-colors hover:bg-muted/50 rounded-md">
              <div className="p-2 bg-purple-500/10 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <MessageSquare className="size-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold tracking-tight">{analytics7d.totalChatSessions.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Chat sessions</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 text-center group transition-colors hover:bg-muted/50 rounded-md">
              <div className="p-2 bg-emerald-500/10 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <Users className="size-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold tracking-tight">{analytics7d.uniqueVisitors.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Unique visitors</p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
              <Link href="/dashboard/analytics">
                View detailed analytics <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agent info */}
      {agent && (
        <Card className="border-muted/60 shadow-sm">
          <CardHeader className="bg-muted/10 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-md">
                <Bot className="size-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Agent Configuration</CardTitle>
                <CardDescription>Current AI agent settings at a glance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border border-muted/50 transition-colors hover:bg-muted/40">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <Bot className="size-3.5" /> Model
                </p>
                <p className="text-sm font-semibold truncate" title={modelLabel}>{modelLabel}</p>
              </div>
              <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border border-muted/50 transition-colors hover:bg-muted/40">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <Sparkles className="size-3.5" /> Behavior
                </p>
                <p className="text-sm font-semibold capitalize truncate">
                  {agent.behaviorType || "Custom"} · {agent.strategyMode || "consultative"}
                </p>
              </div>
              <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border border-muted/50 transition-colors hover:bg-muted/40">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <BarChart3 className="size-3.5" /> Temperature
                </p>
                <p className="text-sm font-semibold">{agent.temperature.toFixed(1)}</p>
              </div>
              <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border border-muted/50 transition-colors hover:bg-muted/40">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <AlertCircle className="size-3.5" /> Status
                </p>
                <div className="flex items-center gap-2">
                  <div className={`size-2 rounded-full ${agent.isEnabled ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                  <p className="text-sm font-semibold">{agent.isEnabled ? "Active" : "Disabled"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-muted/60 shadow-sm flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Briefcase className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base font-semibold">Public Portfolio</CardTitle>
            </div>
            <CardDescription>Share your unique portfolio link with prospects</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-lg border border-muted">
                <div className="flex-1 px-3 py-2 rounded-md text-sm truncate font-mono bg-background border shadow-sm select-all">
                  {process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}
                  {portfolioLink}
                </div>
                <CopyButton text={`${process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${portfolioLink}`} />
              </div>
              <Button variant="outline" className="w-full bg-background" asChild>
                <a href={`${process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${portfolioLink}`} target="_blank" rel="noopener noreferrer">
                  Open in new tab <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/60 shadow-sm flex flex-col h-full">
          <CardHeader>
             <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-muted rounded-md">
                <Sparkles className="size-4 text-foreground" />
              </div>
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </div>
            <CardDescription>Jump straight to key sections of your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <div className="grid gap-2 sm:grid-cols-1">
              <Button variant="outline" className="justify-between h-12 bg-background hover:bg-muted/50 transition-colors group" asChild>
                <Link href="/dashboard/portfolio">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-primary/10 rounded-md group-hover:bg-primary/20 transition-colors">
                      <Briefcase className="size-4 text-primary" />
                    </div>
                    <span className="font-medium">Edit Portfolio</span>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-between h-12 bg-background hover:bg-muted/50 transition-colors group" asChild>
                <Link href="/dashboard/agent">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500/10 rounded-md group-hover:bg-blue-500/20 transition-colors">
                      <Bot className="size-4 text-blue-500" />
                    </div>
                    <span className="font-medium">Configure Agent</span>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-between h-12 bg-background hover:bg-muted/50 transition-colors group" asChild>
                <Link href="/dashboard/leads">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-purple-500/10 rounded-md group-hover:bg-purple-500/20 transition-colors">
                      <Users className="size-4 text-purple-500" />
                    </div>
                    <span className="font-medium">View Leads</span>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
