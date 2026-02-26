"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { Button } from "@/components/ui/button";
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
            className="text-zinc-600 hover:text-zinc-50 transition-colors"
            aria-label={link.platform}
          >
            <Icon className="size-5" />
          </a>
        );
      })}
    </div>
  );
}

export function BoldTemplate({ content }: { content: PortfolioContent }) {
  return (
    <div className="bg-zinc-950 text-zinc-50 min-h-screen selection:bg-amber-400 selection:text-zinc-950 font-sans">
      <header className="sticky top-0 z-20 border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <a href="#" className="flex items-center gap-3">
            <span className="inline-flex size-6 items-center justify-center bg-zinc-50 text-zinc-950 font-bold text-xs">
              B
            </span>
            <span className="text-sm font-bold tracking-widest uppercase">Bold</span>
          </a>
          <nav className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs font-bold tracking-widest uppercase text-zinc-500">
            <a href="#about" className="hover:text-zinc-50 transition-colors">About</a>
            <a href="#services" className="hover:text-zinc-50 transition-colors">Services</a>
            <a href="#work" className="hover:text-zinc-50 transition-colors">Work</a>
            <a href="#contact" className="hover:text-zinc-50 transition-colors">Contact</a>
          </nav>
          <ThemeSwitcher />
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl space-y-8">
            <AnimateIn from="bottom" duration={0.8}>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.95] uppercase text-zinc-50">
                {content.hero.headline}
              </h1>
            </AnimateIn>
            <AnimateIn from="bottom" delay={0.1}>
              <p className="max-w-2xl text-xl sm:text-2xl text-zinc-400 leading-relaxed font-medium">
                {content.hero.subheadline}
              </p>
            </AnimateIn>
            <AnimateIn delay={0.2} from="none">
              <div className="flex flex-wrap items-center gap-6 pt-8">
                <Button
                  asChild
                  size="lg"
                  className="rounded-none bg-zinc-50 text-zinc-950 hover:bg-zinc-200 h-14 px-8 text-sm font-bold uppercase tracking-wider"
                >
                  <a href="#contact">
                    {content.hero.ctaText}
                  </a>
                </Button>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* About */}
      <AnimateIn>
        <section id="about" className="border-t border-zinc-900 px-6 py-24">
          <div className="mx-auto max-w-6xl grid md:grid-cols-[1fr_2fr] gap-12 items-start">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
              About
            </h2>
            <div className="space-y-6">
              <p className="text-2xl sm:text-3xl text-zinc-200 leading-snug font-medium">
                {content.about.paragraph}
              </p>
            </div>
          </div>
        </section>
      </AnimateIn>

      {/* Services */}
      <section id="services" className="border-t border-zinc-900 px-6 py-24">
        <div className="mx-auto max-w-6xl grid md:grid-cols-[1fr_2fr] gap-12 items-start">
          <AnimateIn from="none">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
              Services
            </h2>
          </AnimateIn>
          <StaggerChildren stagger={0.1} className="space-y-12">
            {content.services.map((service, i) => (
              <StaggerItem key={i}>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold uppercase tracking-wide text-zinc-50">
                    {service.title}
                  </h3>
                  <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
                    {service.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Projects */}
      <section id="work" className="border-t border-zinc-900 px-6 py-24">
        <div className="mx-auto max-w-6xl grid md:grid-cols-[1fr_2fr] gap-12 items-start">
          <AnimateIn from="none">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
              Selected Work
            </h2>
          </AnimateIn>
          <StaggerChildren stagger={0.1} className="space-y-16">
            {content.projects.map((project, i) => (
              <StaggerItem key={i}>
                <div className="space-y-6">
                  <h3 className="text-3xl font-black uppercase tracking-tight text-zinc-50">
                    {project.title}
                  </h3>
                  <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
                    {project.description}
                  </p>
                  <div className="inline-block bg-zinc-900/50 px-4 py-3 border border-zinc-800">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-1">
                      Outcome
                    </span>
                    <span className="text-zinc-200 font-medium">{project.result}</span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* CTA */}
      <AnimateIn duration={0.8}>
        <section id="contact" className="border-t border-zinc-900 px-6 py-24 sm:py-32 bg-zinc-900/20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl space-y-8">
              <h2 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-zinc-50">
                {content.cta.headline}
              </h2>
              <p className="text-xl text-zinc-400 leading-relaxed font-medium">
                {content.cta.subtext}
              </p>
              <div className="pt-6">
                <Button
                  asChild
                  size="lg"
                  className="rounded-none bg-zinc-50 text-zinc-950 hover:bg-zinc-200 h-14 px-8 text-sm font-bold uppercase tracking-wider"
                >
                  <a href="#contact">
                    {content.hero.ctaText}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </AnimateIn>

      <footer className="border-t border-zinc-900 px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold uppercase tracking-widest text-zinc-600">
          <span>&copy; {new Date().getFullYear()}</span>
          <div className="flex items-center gap-4">
            <SocialLinks socialLinks={content.socialLinks} />
            <a href="#" className="hover:text-zinc-50 transition-colors">
              Back to top
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
