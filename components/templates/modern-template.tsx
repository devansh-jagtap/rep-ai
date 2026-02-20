"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogoIcon } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ArrowRightIcon, CheckCircle2Icon, SparklesIcon } from "lucide-react";
import { AnimateIn, StaggerChildren, StaggerItem } from "@/components/animate-in";

export function ModernTemplate({ content }: { content: PortfolioContent }) {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <a href="#" aria-label="Back to top" className="flex items-center gap-2">
            <LogoIcon uniColor className="size-5" />
            <span className="text-sm font-medium tracking-wide">Portfolio</span>
          </a>
          <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
            <a href="#about" className="hover:text-foreground transition-colors">
              About
            </a>
            <a href="#services" className="hover:text-foreground transition-colors">
              Services
            </a>
            <a href="#work" className="hover:text-foreground transition-colors">
              Work
            </a>
            <a href="#contact" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>
          <ThemeSwitcher />
        </div>
      </header>

      <div className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.18),transparent_60%)] blur-2xl" />
          <div className="absolute -top-32 right-[-120px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.16),transparent_62%)] blur-2xl" />
          <div className="absolute -bottom-40 left-[-140px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(244,63,94,0.12),transparent_60%)] blur-2xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20 space-y-24">
          {/* Hero */}
          <section className="text-center space-y-6 max-w-3xl mx-auto mt-6">
            <AnimateIn from="none" duration={0.8}>
              <h1 className="text-balance font-serif text-4xl font-medium sm:text-5xl md:text-6xl">
                {content.hero.headline}
              </h1>
            </AnimateIn>
            <AnimateIn delay={0.15}>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-balance">
                {content.hero.subheadline}
              </p>
            </AnimateIn>
            <AnimateIn delay={0.3}>
              <div className="pt-6">
                <Button asChild size="lg" className="rounded-full px-8 h-12 text-base">
                  <a href="#contact">
                    {content.hero.ctaText}
                    <ArrowRightIcon className="ml-2 size-5" />
                  </a>
                </Button>
              </div>
            </AnimateIn>
          </section>

          {/* About */}
          <section id="about" className="max-w-4xl mx-auto">
            <AnimateIn>
              <Card variant="outline" className="p-8 sm:p-12 rounded-3xl bg-background/60">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-balance font-serif text-3xl font-medium md:text-4xl">
                    About
                  </h2>
                  <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border px-3 py-1">Concise</span>
                    <span className="rounded-full border px-3 py-1">Outcome-focused</span>
                  </div>
                </div>
                <p className="mt-5 text-muted-foreground text-lg leading-relaxed text-balance">
                  {content.about.paragraph}
                </p>
              </Card>
            </AnimateIn>
          </section>

          {/* Services */}
          <section id="services" className="space-y-10 max-w-6xl mx-auto">
            <AnimateIn>
              <div className="text-center">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                  What I do
                </p>
                <h2 className="mt-3 text-balance font-serif text-4xl font-medium">
                  Services
                </h2>
              </div>
            </AnimateIn>
            <StaggerChildren stagger={0.08} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {content.services.map((service, i) => (
                <StaggerItem key={`${service.title}-${i}`}>
                  <Card
                    variant="default"
                    className="group h-full p-7 sm:p-8 transition-all hover:-translate-y-0.5"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <SparklesIcon className="size-6" />
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight">{service.title}</h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>

          {/* Projects */}
          <section id="work" className="space-y-10 max-w-6xl mx-auto">
            <AnimateIn>
              <div className="text-center">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                  Proof
                </p>
                <h2 className="mt-3 text-balance font-serif text-4xl font-medium">
                  Featured projects
                </h2>
              </div>
            </AnimateIn>
            <StaggerChildren stagger={0.1} className="grid gap-8 sm:grid-cols-2">
              {content.projects.map((project, i) => (
                <StaggerItem key={`${project.title}-${i}`}>
                  <Card variant="outline" className="h-full overflow-hidden">
                    <div className="p-7 sm:p-8 space-y-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-balance font-serif text-2xl font-medium">
                          {project.title}
                        </h3>
                        <span className="text-xs font-mono text-muted-foreground">
                          #{String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed flex-1 text-lg">
                        {project.description}
                      </p>
                      <div className="rounded-2xl bg-muted/40 p-5 border">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2Icon className="size-5 text-primary" />
                          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                            Result
                          </span>
                        </div>
                        <p className="font-medium text-foreground">{project.result}</p>
                      </div>
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>

          {/* CTA */}
          <section id="contact" className="mx-auto max-w-6xl">
            <AnimateIn>
              <section className="relative overflow-hidden rounded-3xl border bg-card px-6 py-16 sm:px-12 sm:py-20 text-center">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(99,102,241,0.22),transparent_60%)]"
                />
                <div className="relative z-10 mx-auto max-w-2xl space-y-8">
                  <h2 className="text-balance font-serif text-4xl font-medium sm:text-5xl">
                    {content.cta.headline}
                  </h2>
                  <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed text-balance">
                    {content.cta.subtext}
                  </p>
                  <div className="pt-2">
                    <Button asChild size="lg" className="rounded-full px-10 h-14 text-base font-semibold">
                      <a href="#contact">
                        {content.hero.ctaText}
                        <ArrowRightIcon className="ml-2 size-5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </section>
            </AnimateIn>
          </section>
        </div>
      </div>
    </div>
  );
}
