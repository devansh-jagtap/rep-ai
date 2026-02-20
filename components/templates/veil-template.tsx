"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { AnimateIn, StaggerChildren, StaggerItem } from "@/components/animate-in";

export function VeilTemplate({ content }: { content: PortfolioContent }) {
  return (
    <div className="font-sans antialiased text-foreground bg-background selection:bg-primary selection:text-primary-foreground min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:px-12 sm:py-32 space-y-32">
        {/* Hero Section */}
        <section className="space-y-8 max-w-3xl">
          <AnimateIn from="left" duration={0.8}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tighter text-balance leading-[1.1]">
              {content.hero.headline}
            </h1>
          </AnimateIn>
          <AnimateIn from="left" delay={0.15}>
            <p className="text-xl sm:text-2xl text-muted-foreground leading-normal max-w-2xl text-balance">
              {content.hero.subheadline}
            </p>
          </AnimateIn>
          <AnimateIn from="none" delay={0.35}>
            <div className="pt-4">
              <Button size="lg" variant="default" className="rounded-none h-12 px-8 text-base">
                {content.hero.ctaText}
                <ArrowRightIcon className="ml-2 size-4" />
              </Button>
            </div>
          </AnimateIn>
        </section>

        {/* About Section */}
        <AnimateIn>
          <section className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">About</h2>
            <div className="prose prose-lg dark:prose-invert">
              <p className="text-xl sm:text-2xl leading-relaxed text-balance text-foreground font-medium">
                {content.about.paragraph}
              </p>
            </div>
          </section>
        </AnimateIn>

        {/* Services Section */}
        <section className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
          <AnimateIn from="none">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Services</h2>
          </AnimateIn>
          <StaggerChildren stagger={0.12} className="grid sm:grid-cols-2 gap-x-12 gap-y-16">
            {content.services.map((service, i) => (
              <StaggerItem key={i}>
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold tracking-tight">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>

        {/* Projects Section */}
        <section className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
          <AnimateIn from="none">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Selected Work</h2>
          </AnimateIn>
          <div className="space-y-24">
            {content.projects.map((project, i) => (
              <AnimateIn key={i} delay={i * 0.1}>
                <div className="group space-y-6">
                  <h3 className="text-3xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                    {project.description}
                  </p>
                  <div className="border-l-2 border-primary/20 pl-6 py-2">
                    <p className="text-base font-medium">
                      {project.result}
                    </p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <AnimateIn>
          <section className="border-t border-border/50 pt-24 pb-12 text-center max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-balance">
              {content.cta.headline}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {content.cta.subtext}
            </p>
            <div className="pt-4">
              <Button size="lg" className="rounded-none h-14 px-10 text-base">
                {content.hero.ctaText}
              </Button>
            </div>
          </section>
        </AnimateIn>
      </div>
    </div>
  );
}
