import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GeneratePortfolioButton } from "@/components/generate-portfolio-button";
import { ResetOnboardingButton } from "@/components/reset-onboarding-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPortfolioByUserId, type PortfolioOnboardingData } from "@/lib/db/portfolio";
import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { ArrowRightIcon, CheckCircle2Icon, SparklesIcon } from "lucide-react";

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
  const content = portfolio.content as PortfolioContent | null;

  return (
    <main className="mx-auto max-w-7xl p-8 space-y-6">
      <div className="flex mx-auto max-w-4xl items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio Preview</h1>
        <div className="flex items-center gap-2">
          <GeneratePortfolioButton />
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
          <div className="space-y-24 p-8 sm:p-12 md:p-16">
            {/* Hero */}
            <section className="text-center space-y-6 max-w-3xl mx-auto mt-8">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-balance">
                {content.hero.headline}
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {content.hero.subheadline}
              </p>
              <div className="pt-6">
                <Button size="lg" className="rounded-full px-8 h-12 text-base">
                  {content.hero.ctaText}
                  <ArrowRightIcon className="ml-2 size-5" />
                </Button>
              </div>
            </section>

            {/* About */}
            <section className="max-w-3xl mx-auto text-center space-y-4 bg-muted/30 rounded-3xl p-8 sm:p-12">
              <h3 className="text-2xl font-bold tracking-tight">About</h3>
              <p className="text-lg text-muted-foreground leading-relaxed text-balance">
                {content.about.paragraph}
              </p>
            </section>

            {/* Services */}
            <section className="space-y-10 max-w-5xl mx-auto">
              <div className="text-center">
                <h3 className="text-3xl font-bold tracking-tight">Services</h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {content.services.map((service, i) => (
                  <div key={i} className="group relative rounded-2xl border bg-card p-6 sm:p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                    <div className="mb-6 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <SparklesIcon className="size-6" />
                    </div>
                    <h4 className="mb-3 text-xl font-semibold">{service.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Projects */}
            <section className="space-y-10 max-w-5xl mx-auto">
              <div className="text-center">
                <h3 className="text-3xl font-bold tracking-tight">Featured Projects</h3>
              </div>
              <div className="grid gap-8 sm:grid-cols-2">
                {content.projects.map((project, i) => (
                  <div key={i} className="flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                    <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col">
                      <h4 className="text-2xl font-bold">{project.title}</h4>
                      <p className="text-muted-foreground leading-relaxed flex-1 text-lg">
                        {project.description}
                      </p>
                      <div className="mt-6 rounded-xl bg-muted/50 p-5 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2Icon className="size-5 text-primary" />
                          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Result</span>
                        </div>
                        <p className="font-medium text-foreground">{project.result}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground px-6 py-16 sm:px-12 sm:py-24 text-center mx-auto max-w-4xl">
              <div className="absolute inset-0 bg-linear-to-br from-primary-foreground/10 to-transparent pointer-events-none" />
              <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance">
                  {content.cta.headline}
                </h3>
                <p className="text-lg sm:text-xl text-primary-foreground/80 leading-relaxed text-balance">
                  {content.cta.subtext}
                </p>
                <div className="pt-4">
                  <Button size="lg" variant="secondary" className="rounded-full px-8 h-14 text-base font-semibold">
                    {content.hero.ctaText}
                  </Button>
                </div>
              </div>
            </section>
          </div>
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
