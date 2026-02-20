"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LogoIcon } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AnimateIn, StaggerChildren, StaggerItem } from "@/components/animate-in";

export function VeilTemplate({ content }: { content: PortfolioContent }) {
  return (
    <div className="font-sans antialiased text-foreground bg-background selection:bg-primary selection:text-primary-foreground min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <a href="#" aria-label="Back to top" className="flex items-center gap-2">
            <LogoIcon uniColor className="size-5" />
            <span className="text-sm font-medium tracking-wide">Veil</span>
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
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.14),transparent_62%)] blur-3xl" />
          <div className="absolute -bottom-40 right-[-140px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.12),transparent_62%)] blur-3xl" />
          <div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-border/50 lg:block" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            {/* Hero */}
            <section className="space-y-8">
              <AnimateIn from="left" duration={0.8}>
                <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Available for new work
                </div>
              </AnimateIn>
              <AnimateIn from="left" delay={0.1} duration={0.8}>
                <h1 className="text-balance font-serif text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-[1.05]">
                  {content.hero.headline}
                </h1>
              </AnimateIn>
              <AnimateIn from="left" delay={0.2}>
                <p className="text-xl sm:text-2xl text-muted-foreground leading-normal max-w-2xl text-balance">
                  {content.hero.subheadline}
                </p>
              </AnimateIn>
              <AnimateIn from="none" delay={0.35}>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg" variant="default" className="rounded-none h-12 px-8 text-base">
                    <a href="#contact">
                      {content.hero.ctaText}
                      <ArrowRightIcon className="ml-2 size-4" />
                    </a>
                  </Button>
                  <a
                    href="#work"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                  >
                    See selected work
                  </a>
                </div>
              </AnimateIn>
            </section>

            {/* About */}
            <section id="about" className="space-y-6">
              <AnimateIn>
                <Card variant="outline" className="rounded-3xl bg-background/60 p-8 sm:p-10">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                      About
                    </h2>
                    <span className="text-xs text-muted-foreground">01</span>
                  </div>
                  <p className="mt-6 text-lg sm:text-xl leading-relaxed text-balance text-foreground">
                    {content.about.paragraph}
                  </p>
                </Card>
              </AnimateIn>
            </section>
          </div>

          {/* Services */}
          <section id="services" className="mt-20 sm:mt-28 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16 items-start">
            <AnimateIn from="none">
              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Services
                </h2>
                <div className="text-xs text-muted-foreground">02</div>
              </div>
            </AnimateIn>
            <StaggerChildren stagger={0.08} className="grid sm:grid-cols-2 gap-6">
              {content.services.map((service, i) => (
                <StaggerItem key={`${service.title}-${i}`}>
                  <Card variant="outline" className="rounded-3xl p-7 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-semibold tracking-tight">{service.title}</h3>
                      <span className="text-xs font-mono text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>

          {/* Projects */}
          <section id="work" className="mt-20 sm:mt-28 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16 items-start">
            <AnimateIn from="none">
              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Selected work
                </h2>
                <div className="text-xs text-muted-foreground">03</div>
              </div>
            </AnimateIn>
            <div className="space-y-6">
              {content.projects.map((project, i) => (
                <AnimateIn key={`${project.title}-${i}`} delay={i * 0.06}>
                  <Card variant="outline" className="rounded-3xl p-8 sm:p-10">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-balance font-serif text-3xl font-medium tracking-tight">
                        {project.title}
                      </h3>
                      <span className="text-xs font-mono text-muted-foreground">
                        #{String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-4 text-muted-foreground leading-relaxed text-lg max-w-3xl">
                      {project.description}
                    </p>
                    <div className="mt-6 border-l-2 border-primary/25 pl-6 py-2">
                      <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        Outcome
                      </p>
                      <p className="mt-2 text-base font-medium text-foreground">
                        {project.result}
                      </p>
                    </div>
                  </Card>
                </AnimateIn>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section id="contact" className="mt-20 sm:mt-28">
            <AnimateIn>
              <Card className="rounded-3xl p-8 sm:p-12">
                <div className="mx-auto max-w-3xl text-center space-y-7">
                  <h2 className="text-balance font-serif text-4xl sm:text-5xl font-medium tracking-tight">
                    {content.cta.headline}
                  </h2>
                  <p className="text-xl text-muted-foreground leading-relaxed text-balance">
                    {content.cta.subtext}
                  </p>
                  <div className="pt-2">
                    <Button asChild size="lg" className="rounded-none h-14 px-10 text-base">
                      <a href="#contact">
                        {content.hero.ctaText}
                        <ArrowRightIcon className="ml-2 size-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            </AnimateIn>
          </section>

          <footer className="mt-16 sm:mt-20 border-t py-10 text-sm text-muted-foreground flex items-center justify-between gap-4">
            <a href="#" className="hover:text-foreground transition-colors">
              Back to top
            </a>
            <span>&copy; {new Date().getFullYear()}</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
