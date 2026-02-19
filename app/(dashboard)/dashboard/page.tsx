import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
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
import { getPortfolioByUserId } from "@/lib/db/portfolio";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const portfolio = await getPortfolioByUserId(session.user.id);
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
              await signOut({ redirectTo: "/auth/signin" });
            }}
          />
        </div>
      </div>

      <div className="mt-8 space-y-6">
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
            <Separator />
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
