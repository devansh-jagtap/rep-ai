"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogoIcon } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ArrowRight, Check } from "lucide-react";
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

export function LandingTemplate({ content }: { content: PortfolioContent }) {
  return (
    <div className="bg-background text-foreground min-h-screen font-sans">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <a href="#" aria-label="Back to top" className="flex items-center gap-2">
            <LogoIcon uniColor className="size-5" />
            <span className="text-sm font-medium tracking-wide">Portfolio</span>
          </a>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#services" className="hover:text-foreground transition-colors">Services</a>
            <a href="#work" className="hover:text-foreground transition-colors">Work</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
          <ThemeSwitcher />
        </div>
      </header>

      <main className="overflow-hidden">
        {/* Hero */}
        <section className="bg-background">
          <div className="relative py-24 md:py-32">
            <div className="relative z-10 mx-auto w-full max-w-5xl px-6">
              <div className="mx-auto max-w-3xl text-center space-y-8">
                <AnimateIn from="bottom" duration={0.8}>
                  <h1 className="text-balance font-serif text-5xl md:text-7xl font-medium tracking-tight text-foreground leading-[1.1]">
                    {content.hero.headline}
                  </h1>
                </AnimateIn>
                <AnimateIn delay={0.15}>
                  <p className="text-muted-foreground text-balance text-xl leading-relaxed">
                    {content.hero.subheadline}
                  </p>
                </AnimateIn>
                <AnimateIn delay={0.3}>
                  <div className="pt-4">
                    <Button asChild size="lg" className="h-12 px-8 text-base group">
                      <a href="#contact">
                        {content.hero.ctaText}
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                      </a>
                    </Button>
                  </div>
                </AnimateIn>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="bg-muted/30 py-24 border-y border-border/50">
          <div className="mx-auto max-w-5xl px-6">
            <AnimateIn>
              <div className="max-w-3xl">
                <h2 className="text-balance font-serif text-3xl md:text-4xl font-medium text-foreground mb-6">
                  About
                </h2>
                <p className="text-muted-foreground text-xl leading-relaxed">
                  {content.about.paragraph}
                </p>
              </div>
            </AnimateIn>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <AnimateIn>
              <div className="mb-16">
                <h2 className="text-balance font-serif text-4xl font-medium text-foreground">Services</h2>
              </div>
            </AnimateIn>

            <StaggerChildren stagger={0.1} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {content.services.map((service, i) => (
                <StaggerItem key={i}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
                        <Check className="size-3.5 text-primary" />
                      </div>
                      <h3 className="text-foreground font-medium text-lg">{service.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Projects */}
        <section id="work" className="bg-muted/30 py-24 border-y border-border/50">
          <div className="mx-auto max-w-5xl px-6">
            <AnimateIn>
              <div className="mb-16">
                <h2 className="text-balance font-serif text-4xl font-medium text-foreground">Selected Work</h2>
              </div>
            </AnimateIn>

            <StaggerChildren stagger={0.15} className="space-y-16">
              {content.projects.map((project, i) => (
                <StaggerItem key={i}>
                  <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-serif font-medium text-foreground">
                        {project.title}
                      </h3>
                      <p className="text-sm font-medium text-muted-foreground">
                        Outcome: <span className="text-foreground">{project.result}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="py-32">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <AnimateIn>
              <div className="max-w-2xl mx-auto space-y-8">
                <h2 className="text-balance font-serif text-4xl md:text-5xl font-medium text-foreground">
                  {content.cta.headline}
                </h2>
                <p className="text-muted-foreground text-xl">
                  {content.cta.subtext}
                </p>
                <div className="pt-6">
                  <Button asChild size="lg" className="h-14 px-10 text-base group">
                    <a href="#contact">
                      {content.hero.ctaText}
                      <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </AnimateIn>
          </div>
        </section>

        <footer className="py-8 border-t border-border/50">
          <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {content.hero.headline}</p>
            <div className="flex items-center gap-6">
              <SocialLinks socialLinks={content.socialLinks} />
              <a href="#" className="hover:text-foreground transition-colors">Back to top</a>
              <ThemeSwitcher />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

