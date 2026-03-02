import { redirect } from "next/navigation";
import { getSession, signOut } from "@/auth";
import { DashboardUserMenu } from "@/components/dashboard-user-menu";
import { ResetOnboardingButton } from "@/components/reset-onboarding-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProfileById } from "@/lib/db";
import { getActivePortfolio } from "@/lib/active-portfolio";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLink, Palette } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const portfolio = await getActivePortfolio(session.user.id);
  if (!portfolio) {
    redirect("/onboarding");
  }

  const profile = await getProfileById(session.user.id);

  return (
    <main className="mx-auto max-w-5xl p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <ResetOnboardingButton />
          <DashboardUserMenu
            name={session.user.name}
            email={session.user.email}
            signOutAction={async () => {
              "use server";
              await signOut();
              redirect("/auth/signin");
            }}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Portfolio</CardTitle>
            <CardDescription>
              Manage your portfolio website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-16">Status:</span>
                {portfolio.isPublished ? (
                  <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-16">Handle:</span>
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded-sm text-xs">Mimick.me.io/{portfolio.handle}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-16">Theme:</span>
                <span className="capitalize font-medium">{portfolio.template}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/preview">
                <Button>
                  <Palette className="mr-2 size-4" />
                  Edit Design
                </Button>
              </Link>
              <Link href="/dashboard/agent">
                <Button variant="outline">Configure AI Agent</Button>
              </Link>
              {portfolio.isPublished && (
                <a href={`/${portfolio.handle}`} target="_blank" rel="noreferrer">
                  <Button variant="outline">
                    <ExternalLink className="mr-2 size-4" />
                    View Live Site
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Your profile and subscription details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-sm">
                {profile?.email}
              </span>
              <Badge variant="secondary">{profile?.plan}</Badge>
              <Badge variant="outline">{profile?.credits ?? 0} credits</Badge>
            </div>

            <Separator className="mt-4" />
            <p className="text-muted-foreground text-sm">
              Signed in as {profile?.name ?? profile?.email}. You have{" "}
              {profile?.credits ?? 0} credits remaining on your {profile?.plan}{" "}
              plan.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
