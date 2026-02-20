"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CheckCircle2Icon, SparklesIcon } from "lucide-react";
import { AnimateIn, StaggerChildren, StaggerItem } from "@/components/animate-in";

export function ModernTemplate({ content }: { content: PortfolioContent }) {
  return (
    <div className="space-y-24 p-8 sm:p-12 md:p-16 bg-background">
      {/* Hero */}
      <section className="text-center space-y-6 max-w-3xl mx-auto mt-8">
        <AnimateIn from="none" duration={0.8}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-balance">
            {content.hero.headline}
          </h2>
        </AnimateIn>
        <AnimateIn delay={0.15}>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {content.hero.subheadline}
          </p>
        </AnimateIn>
        <AnimateIn delay={0.3}>
          <div className="pt-6">
            <Button size="lg" className="rounded-full px-8 h-12 text-base">
              {content.hero.ctaText}
              <ArrowRightIcon className="ml-2 size-5" />
            </Button>
          </div>
        </AnimateIn>
      </section>

      {/* About */}
      <AnimateIn>
        <section className="max-w-3xl mx-auto text-center space-y-4 bg-muted/30 rounded-3xl p-8 sm:p-12">
          <h3 className="text-2xl font-bold tracking-tight">About</h3>
          <p className="text-lg text-muted-foreground leading-relaxed text-balance">
            {content.about.paragraph}
          </p>
        </section>
      </AnimateIn>

      {/* Services */}
      <section className="space-y-10 max-w-5xl mx-auto">
        <AnimateIn>
          <div className="text-center">
            <h3 className="text-3xl font-bold tracking-tight">Services</h3>
          </div>
        </AnimateIn>
        <StaggerChildren stagger={0.1} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.services.map((service, i) => (
            <StaggerItem key={i}>
              <div className="group relative rounded-2xl border bg-card p-6 sm:p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/20 h-full">
                <div className="mb-6 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <SparklesIcon className="size-6" />
                </div>
                <h4 className="mb-3 text-xl font-semibold">{service.title}</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* Projects */}
      <section className="space-y-10 max-w-5xl mx-auto">
        <AnimateIn>
          <div className="text-center">
            <h3 className="text-3xl font-bold tracking-tight">Featured Projects</h3>
          </div>
        </AnimateIn>
        <StaggerChildren stagger={0.15} className="grid gap-8 sm:grid-cols-2">
          {content.projects.map((project, i) => (
            <StaggerItem key={i}>
              <div className="flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md h-full">
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
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* CTA */}
      <AnimateIn>
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
      </AnimateIn>
    </div>
  );
}
