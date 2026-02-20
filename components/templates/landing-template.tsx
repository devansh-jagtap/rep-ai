"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogoIcon } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ArrowRight, Check } from "lucide-react";
import { AnimateIn, StaggerChildren, StaggerItem } from "@/components/animate-in";

export function LandingTemplate({ content }: { content: PortfolioContent }) {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
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

      <main className="overflow-hidden">
        {/* Hero */}
        <section className="bg-background">
          <div className="relative py-24 md:py-32">
            <div
              aria-hidden
              className="mask-radial-from-45% mask-radial-to-75% mask-radial-at-top mask-radial-[75%_100%] mask-t-from-50% absolute inset-0 aspect-square dark:opacity-10"
            >
              <Image
                src="https://images.unsplash.com/photo-1740516367177-ae20098c8786?q=80&w=2268&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt=""
                width={2268}
                height={1740}
                className="size-full object-cover object-top"
                priority
              />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-5xl px-6">
              <div className="mx-auto max-w-2xl text-center">
                <AnimateIn from="none" duration={0.8}>
                  <h1 className="text-balance font-serif text-4xl font-medium sm:text-5xl md:text-6xl">
                    {content.hero.headline}
                  </h1>
                </AnimateIn>
                <AnimateIn delay={0.15}>
                  <p className="text-muted-foreground mt-4 text-balance text-lg leading-relaxed sm:text-xl">
                    {content.hero.subheadline}
                  </p>
                </AnimateIn>
                <AnimateIn delay={0.3}>
                  <Button asChild className="mt-8 gap-2">
                    <a href="#contact">
                      {content.hero.ctaText}
                      <ArrowRight className="size-4" />
                    </a>
                  </Button>
                </AnimateIn>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="bg-background @container py-24">
          <div className="mx-auto max-w-5xl px-6">
            <AnimateIn>
              <Card variant="outline" className="p-8 md:p-12">
                <h2 className="text-balance font-serif text-3xl font-medium md:text-4xl">
                  About
                </h2>
                <p className="text-muted-foreground mt-4 text-balance text-lg leading-relaxed">
                  {content.about.paragraph}
                </p>
              </Card>
            </AnimateIn>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="bg-background @container py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="space-y-4">
              <AnimateIn>
                <h2 className="text-balance font-serif text-4xl font-medium">Services</h2>
              </AnimateIn>
              <AnimateIn delay={0.1}>
                <p className="text-muted-foreground max-w-2xl text-balance">
                  A clear set of offerings, with outcomes you can measure.
                </p>
              </AnimateIn>
            </div>

            <StaggerChildren stagger={0.08} className="@xl:grid-cols-3 mt-12 grid gap-6 sm:grid-cols-2">
              {content.services.map((service, i) => (
                <StaggerItem key={`${service.title}-${i}`}>
                  <Card variant="mixed" className="h-full p-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex size-5 items-center justify-center rounded-full border border-foreground/15">
                        <Check className="size-3 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-foreground font-medium">{service.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Projects */}
        <section id="work" className="bg-background @container py-24">
          <div className="mx-auto max-w-5xl px-6">
            <AnimateIn>
              <div className="text-center">
                <h2 className="text-balance font-serif text-4xl font-medium">Selected work</h2>
                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-balance">
                  A few recent projects, focused on results.
                </p>
              </div>
            </AnimateIn>

            <StaggerChildren stagger={0.08} className="mt-12 grid gap-6 @xl:grid-cols-2">
              {content.projects.map((project, i) => (
                <StaggerItem key={`${project.title}-${i}`}>
                  <Card variant="outline" className="p-6">
                    <div className="space-y-4">
                      <h3 className="text-balance font-serif text-2xl font-medium">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {project.description}
                      </p>
                      <div className="rounded-xl border bg-muted/40 p-4">
                        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                          Result
                        </div>
                        <div className="mt-1 text-sm font-medium">{project.result}</div>
                      </div>
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="bg-background @container py-24">
          <div className="mx-auto max-w-5xl px-6">
            <AnimateIn>
              <Card variant="outline" className="@xl:grid-cols-2 grid gap-8 p-6 md:p-10">
                <div>
                  <h2 className="text-balance font-serif text-3xl font-medium">
                    {content.cta.headline}
                  </h2>
                  <p className="text-muted-foreground mt-3 text-balance">
                    {content.cta.subtext}
                  </p>
                </div>
                <div className="bg-muted/50 flex flex-col justify-center rounded-xl border p-6">
                  <p className="text-muted-foreground text-sm">Next step</p>
                  <p className="mt-1 font-serif text-3xl font-medium">Let’s talk</p>
                  <Button asChild className="mt-6 gap-2">
                    <a href="#contact">
                      {content.hero.ctaText}
                      <ArrowRight className="size-4" />
                    </a>
                  </Button>
                </div>
              </Card>
            </AnimateIn>
          </div>
        </section>

        <footer className="bg-background @container py-12">
          <div className="mx-auto max-w-5xl px-6">
            <div className="flex flex-col gap-6 border-t pt-8">
              <div className="flex items-center justify-between gap-4">
                <a href="#" aria-label="Back to top" className="flex items-center gap-2">
                  <LogoIcon uniColor className="size-5" />
                  <span className="text-sm text-muted-foreground">ref</span>
                </a>
                <ThemeSwitcher />
              </div>
              <p className="text-muted-foreground text-sm">
                &copy; {new Date().getFullYear()} {content.hero.headline}
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

