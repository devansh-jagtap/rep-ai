import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ResetOnboardingButton } from "@/components/reset-onboarding-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPortfolioByUserId, type PortfolioOnboardingData } from "@/lib/db/portfolio";

export default async function DashboardPreviewPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/preview");
  }

  const portfolio = await getPortfolioByUserId(session.user.id);
  if (!portfolio) {
    redirect("/onboarding");
  }

  const onboardingData = portfolio.onboardingData as PortfolioOnboardingData;

  return (
    <main className="mx-auto max-w-4xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio Preview</h1>
        <ResetOnboardingButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{onboardingData.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Title</p>
            <p>{onboardingData.title}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Bio</p>
            <p>{onboardingData.bio}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Services</p>
            <ul className="list-disc ml-5">
              {onboardingData.services.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Projects</p>
            <div className="space-y-2 mt-1">
              {onboardingData.projects.map((project, index) => (
                <div key={`${project.title}-${index}`} className="rounded-md border p-3">
                  <p className="font-medium">{project.title}</p>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Tone</p>
            <p>{onboardingData.tone}</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-muted-foreground">AI portfolio generation coming next.</p>
    </main>
  );
}
