"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogoIcon } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ArrowRightIcon } from "lucide-react";
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

export function ModernTemplate({ content }: { content: PortfolioContent }) {
  return (
    <div className="bg-background text-foreground min-h-screen font-sans">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <a href="#" aria-label="Back to top" className="flex items-center gap-2">
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

      <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24 space-y-32">
        {/* Hero */}
        <section className="space-y-8 max-w-3xl pt-8 sm:pt-12">
          <AnimateIn from="none" duration={0.8}>
            <h1 className="text-balance text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground">
              {content.hero.headline}
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.15}>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl text-balance">
              {content.hero.subheadline}
            </p>
          </AnimateIn>
          <AnimateIn delay={0.3}>
            <div className="pt-4">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <a href="#contact">
                  {content.hero.ctaText}
                </a>
              </Button>
            </div>
          </AnimateIn>
        </section>

        {/* About */}
        <section id="about" className="grid sm:grid-cols-[1fr_2fr] gap-8 items-start">
          <AnimateIn>
            <h2 className="text-3xl font-medium text-foreground">About</h2>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed">
              {content.about.paragraph}
            </p>
          </AnimateIn>
        </section>

        {/* Services */}
        <section id="services" className="space-y-12">
          <AnimateIn>
            <h2 className="text-3xl font-medium text-foreground">Services</h2>
          </AnimateIn>
          <StaggerChildren stagger={0.08} className="grid gap-6 sm:grid-cols-2">
            {content.services.map((service, i) => (
              <StaggerItem key={i}>
                <Card variant="outline" className="p-8 h-full bg-muted/20 border-border/50">
                  <h3 className="text-lg font-medium text-foreground">{service.title}</h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>

        {/* Projects */}
        <section id="work" className="space-y-12">
          <AnimateIn>
            <h2 className="text-3xl font-medium text-foreground">Selected Work</h2>
          </AnimateIn>
          <StaggerChildren stagger={0.15} className="space-y-12">
            {content.projects.map((project, i) => (
              <StaggerItem key={i}>
                <div className="grid md:grid-cols-[1fr_2fr] gap-6 md:gap-12 pb-12 border-b border-border/50 last:border-0 last:pb-0">
                  <div>
                    <h3 className="text-2xl font-medium text-foreground">{project.title}</h3>
                  </div>
                  <div className="space-y-6">
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {project.description}
                    </p>
                    <div className="bg-muted/30 p-6 rounded-xl">
                      <p className="text-sm font-medium text-foreground mb-2">Outcome</p>
                      <p className="text-muted-foreground">{project.result}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>

        {/* CTA */}
        <section id="contact" className="py-12 border-t border-border/50">
          <AnimateIn>
            <div className="max-w-2xl space-y-6">
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
                {content.cta.headline}
              </h2>
              <p className="text-lg text-muted-foreground">
                {content.cta.subtext}
              </p>
              <div className="pt-4">
                <Button asChild size="lg" className="h-12 px-8 text-base group">
                  <a href="#contact">
                    {content.hero.ctaText}
                    <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </div>
            </div>
          </AnimateIn>
        </section>
      </main>
      
      <footer className="border-t py-8 mt-12">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {content.hero.headline}</p>
          <div className="flex items-center gap-4">
            <SocialLinks socialLinks={content.socialLinks} />
            <a href="#" className="hover:text-foreground transition-colors">Back to top</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
