"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LogoIcon } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AnimateIn, StaggerChildren, StaggerItem } from "@/components/animate-in";
import { Twitter, Linkedin, Github, Instagram, Youtube, Facebook, Globe } from "lucide-react";

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  website: Globe,
};

function SocialLinks({ socialLinks }: { socialLinks: PortfolioContent["socialLinks"] }) {
  if (!socialLinks || socialLinks.length === 0) return null;
  
  const enabledLinks = socialLinks.filter(link => link.enabled && link.url);
  if (enabledLinks.length === 0) return null;

  return (
    <div className="flex items-center gap-4">
      {enabledLinks.map((link) => {
        const Icon = platformIcons[link.platform] || Globe;
        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={link.platform}
          >
            <Icon className="size-5" />
          </a>
        );
      })}
    </div>
  );
}

export function VeilTemplate({ content }: { content: PortfolioContent }) {
  return (
    <div className="font-sans antialiased text-foreground bg-background min-h-screen">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm border-b border-border/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <a href="#" aria-label="Back to top" className="flex items-center gap-2">
            <LogoIcon uniColor className="size-5 opacity-80" />
            <span className="text-sm font-medium tracking-wide">Veil</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#services" className="hover:text-foreground transition-colors">Services</a>
            <a href="#work" className="hover:text-foreground transition-colors">Work</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
          <ThemeSwitcher />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        {/* Hero */}
        <section className="space-y-8 max-w-3xl pt-8 sm:pt-16">
          <AnimateIn from="bottom" duration={0.8}>
            <h1 className="text-balance font-serif text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-[1.1] text-foreground">
              {content.hero.headline}
            </h1>
          </AnimateIn>
          <AnimateIn from="bottom" delay={0.1} duration={0.8}>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl text-balance">
              {content.hero.subheadline}
            </p>
          </AnimateIn>
          <AnimateIn from="none" delay={0.2}>
            <div className="pt-6 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" variant="default" className="h-12 px-8 text-base">
                <a href="#contact">
                  {content.hero.ctaText}
                </a>
              </Button>
              <a
                href="#work"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                View selected work
              </a>
            </div>
          </AnimateIn>
        </section>

        {/* About */}
        <section id="about" className="mt-24 sm:mt-32">
          <AnimateIn>
            <div className="max-w-3xl">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
                About
              </h2>
              <p className="text-xl sm:text-2xl leading-relaxed text-balance text-foreground font-serif">
                {content.about.paragraph}
              </p>
            </div>
          </AnimateIn>
        </section>

        {/* Services */}
        <section id="services" className="mt-24 sm:mt-32">
          <AnimateIn from="none">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
              Services
            </h2>
          </AnimateIn>
          <StaggerChildren stagger={0.1} className="grid sm:grid-cols-2 gap-8 lg:gap-12">
            {content.services.map((service, i) => (
              <StaggerItem key={i}>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>

        {/* Projects */}
        <section id="work" className="mt-24 sm:mt-32">
          <AnimateIn from="none">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
              Selected Work
            </h2>
          </AnimateIn>
          <div className="space-y-16">
            {content.projects.map((project, i) => (
              <AnimateIn key={i} delay={i * 0.1}>
                <div className="group flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-16 border-t border-border/50 pt-8">
                  <div className="md:w-1/3 shrink-0 space-y-2">
                    <h3 className="text-2xl font-serif font-medium text-foreground">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {project.result}
                    </p>
                  </div>
                  <div className="md:w-2/3">
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {project.description}
                    </p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="mt-24 sm:mt-32">
          <AnimateIn>
            <div className="py-16 sm:py-24 border-y border-border/50">
              <div className="max-w-2xl space-y-8">
                <h2 className="text-balance font-serif text-4xl sm:text-5xl font-medium tracking-tight text-foreground">
                  {content.cta.headline}
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed text-balance">
                  {content.cta.subtext}
                </p>
                <div className="pt-4">
                  <Button asChild size="lg" className="h-14 px-10 text-base group">
                    <a href="#contact">
                      {content.hero.ctaText}
                      <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </AnimateIn>
        </section>

        <footer className="mt-16 flex items-center justify-between gap-4 text-sm text-muted-foreground pb-8">
          <span>&copy; {new Date().getFullYear()}</span>
          <div className="flex items-center gap-4">
            <SocialLinks socialLinks={content.socialLinks} />
            <a href="#" className="hover:text-foreground transition-colors">
              Back to top
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
