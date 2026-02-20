"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { Button } from "@/components/ui/button";
import { ArrowUpRightIcon, ZapIcon } from "lucide-react";
import { AnimateIn, StaggerChildren, StaggerItem } from "@/components/animate-in";

export function BoldTemplate({ content }: { content: PortfolioContent }) {
  return (
    <div className="bg-zinc-950 text-zinc-50 min-h-screen selection:bg-amber-400 selection:text-zinc-950">
      {/* Hero */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(251,191,36,0.08),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-10">
          <AnimateIn from="none" duration={1}>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] text-balance uppercase">
              {content.hero.headline}
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.2}>
            <p className="mx-auto max-w-2xl text-xl sm:text-2xl text-zinc-400 leading-relaxed">
              {content.hero.subheadline}
            </p>
          </AnimateIn>
          <AnimateIn delay={0.4} from="none">
            <div className="pt-6">
              <Button
                size="lg"
                className="rounded-none bg-amber-400 text-zinc-950 hover:bg-amber-300 h-14 px-10 text-base font-bold uppercase tracking-wider"
              >
                {content.hero.ctaText}
                <ArrowUpRightIcon className="ml-2 size-5" />
              </Button>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* About */}
      <AnimateIn>
        <section className="border-t border-zinc-800 px-6 py-24 sm:px-12 sm:py-32">
          <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-16 items-center">
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter">
              About<span className="text-amber-400">.</span>
            </h2>
            <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed">
              {content.about.paragraph}
            </p>
          </div>
        </section>
      </AnimateIn>

      {/* Services */}
      <section className="border-t border-zinc-800 px-6 py-24 sm:px-12 sm:py-32">
        <div className="mx-auto max-w-5xl space-y-16">
          <AnimateIn>
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-center">
              What I Do<span className="text-amber-400">.</span>
            </h2>
          </AnimateIn>
          <StaggerChildren stagger={0.08} className="divide-y divide-zinc-800">
            {content.services.map((service, i) => (
              <StaggerItem key={i} from="right">
                <div className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 py-10 transition-colors hover:bg-zinc-900/50 -mx-6 px-6 sm:-mx-12 sm:px-12">
                  <div className="flex items-center gap-4 sm:w-1/3 shrink-0">
                    <span className="text-sm font-mono text-zinc-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <ZapIcon className="size-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-2xl font-bold tracking-tight">{service.title}</h3>
                  </div>
                  <p className="text-zinc-400 leading-relaxed flex-1">
                    {service.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Projects */}
      <section className="border-t border-zinc-800 px-6 py-24 sm:px-12 sm:py-32">
        <div className="mx-auto max-w-5xl space-y-16">
          <AnimateIn>
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-center">
              Work<span className="text-amber-400">.</span>
            </h2>
          </AnimateIn>
          <div className="space-y-0 divide-y divide-zinc-800">
            {content.projects.map((project, i) => (
              <AnimateIn key={i} from="left" delay={i * 0.1}>
                <div className="group py-16 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-3xl sm:text-4xl font-black tracking-tight uppercase group-hover:text-amber-400 transition-colors">
                      {project.title}
                    </h3>
                    <ArrowUpRightIcon className="size-8 text-zinc-700 group-hover:text-amber-400 transition-colors shrink-0 mt-1" />
                  </div>
                  <p className="text-lg text-zinc-400 leading-relaxed max-w-3xl">
                    {project.description}
                  </p>
                  <div className="inline-flex items-center gap-3 rounded-none bg-amber-400/10 border border-amber-400/20 px-5 py-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Impact</span>
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
        <section className="border-t border-zinc-800 px-6 py-32 sm:px-12 sm:py-40">
          <div className="mx-auto max-w-4xl text-center space-y-10">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-balance">
              {content.cta.headline}
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-zinc-400 leading-relaxed">
              {content.cta.subtext}
            </p>
            <div className="pt-6">
              <Button
                size="lg"
                className="rounded-none bg-amber-400 text-zinc-950 hover:bg-amber-300 h-16 px-12 text-lg font-bold uppercase tracking-wider"
              >
                {content.hero.ctaText}
              </Button>
            </div>
          </div>
        </section>
      </AnimateIn>
    </div>
  );
}
