"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { Button } from "@/components/ui/button";
import { ArrowUpRightIcon, ZapIcon } from "lucide-react";
import { AnimateIn, StaggerChildren, StaggerItem } from "@/components/animate-in";

export function BoldTemplate({ content }: { content: PortfolioContent }) {
  return (
    <div className="bg-zinc-950 text-zinc-50 min-h-screen selection:bg-amber-400 selection:text-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-900 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <a href="#" className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-sm bg-amber-400 text-zinc-950 font-black">
              B
            </span>
            <span className="text-sm font-bold tracking-widest uppercase">Bold</span>
          </a>
          <nav className="hidden items-center gap-5 text-xs font-bold tracking-widest uppercase text-zinc-400 sm:flex">
            <a href="#about" className="hover:text-zinc-50 transition-colors">
              About
            </a>
            <a href="#services" className="hover:text-zinc-50 transition-colors">
              Services
            </a>
            <a href="#work" className="hover:text-zinc-50 transition-colors">
              Work
            </a>
            <a href="#contact" className="hover:text-zinc-50 transition-colors">
              Contact
            </a>
          </nav>
          <div className="hidden sm:block text-xs text-zinc-500">
            <span className="text-amber-400">●</span> Online
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(251,191,36,0.10),transparent_58%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-zinc-900 lg:block"
        />

        <div className="relative z-10 mx-auto max-w-6xl grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 items-start">
          <div className="space-y-10">
            <AnimateIn from="none" duration={1}>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] text-balance uppercase">
                {content.hero.headline}
              </h1>
            </AnimateIn>
            <AnimateIn delay={0.2}>
              <p className="max-w-2xl text-xl sm:text-2xl text-zinc-400 leading-relaxed">
                {content.hero.subheadline}
              </p>
            </AnimateIn>
            <AnimateIn delay={0.35} from="none">
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="rounded-none bg-amber-400 text-zinc-950 hover:bg-amber-300 h-14 px-10 text-base font-bold uppercase tracking-wider"
                >
                  <a href="#contact">
                    {content.hero.ctaText}
                    <ArrowUpRightIcon className="ml-2 size-5" />
                  </a>
                </Button>
                <a
                  href="#work"
                  className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-50 transition-colors"
                >
                  View work
                </a>
              </div>
            </AnimateIn>
          </div>

          <AnimateIn delay={0.15} from="right">
            <div className="rounded-none border border-zinc-800 bg-zinc-950/40 p-8">
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Snapshot
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-400 text-sm">Style</span>
                  <span className="text-zinc-50 text-sm font-bold">Direct</span>
                </div>
                <div className="h-px bg-zinc-900" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-400 text-sm">Focus</span>
                  <span className="text-zinc-50 text-sm font-bold">Outcomes</span>
                </div>
                <div className="h-px bg-zinc-900" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-400 text-sm">Availability</span>
                  <span className="text-amber-400 text-sm font-bold">Open</span>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* About */}
      <AnimateIn>
        <section id="about" className="border-t border-zinc-900 px-6 py-24 sm:px-12 sm:py-32">
          <div className="mx-auto max-w-6xl grid md:grid-cols-[1fr_1.2fr] gap-14 items-start">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">01</p>
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter">
                About<span className="text-amber-400">.</span>
              </h2>
            </div>
            <div className="rounded-none border border-zinc-800 bg-zinc-950/40 p-8 sm:p-10">
              <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed">
                {content.about.paragraph}
              </p>
            </div>
          </div>
        </section>
      </AnimateIn>

      {/* Services */}
      <section id="services" className="border-t border-zinc-900 px-6 py-24 sm:px-12 sm:py-32">
        <div className="mx-auto max-w-6xl space-y-16">
          <AnimateIn>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">02</p>
                <h2 className="mt-3 text-4xl sm:text-5xl font-black uppercase tracking-tighter">
                  Services<span className="text-amber-400">.</span>
                </h2>
              </div>
              <p className="hidden max-w-md text-sm text-zinc-500 sm:block">
                Clear scope. Fast iterations. Measurable impact.
              </p>
            </div>
          </AnimateIn>
          <StaggerChildren stagger={0.08} className="grid gap-4">
            {content.services.map((service, i) => (
              <StaggerItem key={i} from="right">
                <div className="group rounded-none border border-zinc-800 bg-zinc-950/40 p-7 sm:p-8 transition-colors hover:bg-zinc-900/30">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-10">
                    <div className="flex items-center gap-4 sm:w-[320px] shrink-0">
                      <span className="text-sm font-mono text-zinc-600">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <ZapIcon className="size-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <h3 className="text-2xl font-black tracking-tight uppercase">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-zinc-300 leading-relaxed flex-1">
                      {service.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Projects */}
      <section id="work" className="border-t border-zinc-900 px-6 py-24 sm:px-12 sm:py-32">
        <div className="mx-auto max-w-6xl space-y-16">
          <AnimateIn>
            <div className="text-center space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">03</p>
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter">
                Work<span className="text-amber-400">.</span>
              </h2>
            </div>
          </AnimateIn>
          <div className="grid gap-6">
            {content.projects.map((project, i) => (
              <AnimateIn key={i} from="left" delay={i * 0.1}>
                <div className="group rounded-none border border-zinc-800 bg-zinc-950/40 p-8 sm:p-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="text-xs font-mono text-zinc-600">
                        CASE {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-black tracking-tight uppercase group-hover:text-amber-400 transition-colors">
                        {project.title}
                      </h3>
                    </div>
                    <ArrowUpRightIcon className="size-8 text-zinc-700 group-hover:text-amber-400 transition-colors shrink-0 mt-1" />
                  </div>
                  <p className="mt-6 text-lg text-zinc-300 leading-relaxed max-w-4xl">
                    {project.description}
                  </p>
                  <div className="mt-8 inline-flex items-center gap-3 rounded-none bg-amber-400/10 border border-amber-400/20 px-5 py-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                      Outcome
                    </span>
                    <span className="text-sm font-medium text-zinc-200">{project.result}</span>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <AnimateIn duration={0.8}>
        <section id="contact" className="border-t border-zinc-900 px-6 py-28 sm:px-12 sm:py-36">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-none border border-zinc-800 bg-zinc-950/40 p-10 sm:p-14 text-center space-y-10">
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">04</p>
                <h2 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-balance">
                  {content.cta.headline}
                </h2>
              </div>
              <p className="mx-auto max-w-3xl text-xl text-zinc-300 leading-relaxed text-balance">
                {content.cta.subtext}
              </p>
              <div className="pt-2">
                <Button
                  asChild
                  size="lg"
                  className="rounded-none bg-amber-400 text-zinc-950 hover:bg-amber-300 h-16 px-12 text-lg font-bold uppercase tracking-wider"
                >
                  <a href="#contact">
                    {content.hero.ctaText}
                    <ArrowUpRightIcon className="ml-2 size-5" />
                  </a>
                </Button>
              </div>
            </div>
            <footer className="mt-10 flex items-center justify-between gap-4 text-xs font-mono text-zinc-600">
              <a href="#" className="hover:text-zinc-200 transition-colors">
                TOP
              </a>
              <span>&copy; {new Date().getFullYear()}</span>
            </footer>
          </div>
        </section>
      </AnimateIn>
    </div>
  );
}
