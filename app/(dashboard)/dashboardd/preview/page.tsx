import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GeneratePortfolioButton } from "@/components/generate-portfolio-button";
import { PublishPortfolioButton } from "@/components/publish-portfolio-button";
import { ResetOnboardingButton } from "@/components/reset-onboarding-button";
import { TemplateSelector } from "@/components/template-selector";
import { ModernTemplate } from "@/components/templates/modern-template";
import { VeilTemplate } from "@/components/templates/veil-template";
import { BoldTemplate } from "@/components/templates/bold-template";
import { EditorialTemplate } from "@/components/templates/editorial-template";
import { LandingTemplate } from "@/components/templates/landing-template";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type PortfolioOnboardingData } from "@/lib/db/portfolio";
import { getActivePortfolio } from "@/lib/active-portfolio";
import type { PortfolioContent } from "@/lib/validation/portfolio-schema";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function DashboardPreviewPage(props: { searchParams?: SearchParams }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/preview");
  }

  const portfolio = await getActivePortfolio(session.user.id);
  if (!portfolio) {
    redirect("/onboarding");
  }

  const onboardingData = portfolio.onboardingData as PortfolioOnboardingData;
  const content = portfolio.content as PortfolioContent | null;
  const resolvedParams = props.searchParams ? await props.searchParams : {};
  const theme = typeof resolvedParams.theme === "string" ? resolvedParams.theme : "modern";

  return (
    <main className="mx-auto max-w-7xl p-8 space-y-6">
      <div className="flex mx-auto max-w-4xl items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio Preview</h1>
        <div className="flex items-center gap-2">
          {content && <TemplateSelector />}
          <GeneratePortfolioButton />
          {content && <PublishPortfolioButton handle={portfolio.handle} theme={theme} />}
          <ResetOnboardingButton />
        </div>
      </div>

      {content ? (
        <div className="rounded-xl border bg-background shadow-lg overflow-hidden flex flex-col">
          {/* Mock Browser Header */}
          <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-3">
            <div className="size-3 rounded-full bg-red-500/80" />
            <div className="size-3 rounded-full bg-yellow-500/80" />
            <div className="size-3 rounded-full bg-green-500/80" />
            <div className="ml-4 flex-1 text-center text-xs font-medium text-muted-foreground font-mono truncate">
              {portfolio.handle}.ref.com
            </div>
          </div>

          {/* Preview Body */}
          {theme === "landing" ? (
            <LandingTemplate content={content} />
          ) : theme === "veil" ? (
            <VeilTemplate content={content} />
          ) : theme === "bold" ? (
            <BoldTemplate content={content} />
          ) : theme === "editorial" ? (
            <EditorialTemplate content={content} />
          ) : (
            <ModernTemplate content={content} />
          )}
        </div>
      ) : (
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
      )}
    </main>
  );
}
