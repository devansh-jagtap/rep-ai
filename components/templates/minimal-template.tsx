"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ArrowRightIcon, ChevronDownIcon, MinusIcon, PlusIcon } from "lucide-react";
import { AnimateIn, StaggerItem } from "@/components/animate-in";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
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
            className="text-stone-500 hover:text-stone-900 transition-colors"
            aria-label={link.platform}
          >
            <Icon className="size-5" />
          </a>
        );
      })}
    </div>
  );
}

export function MinimalTemplate({ content }: { content: PortfolioContent }) {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [expandedService, setExpandedService] = useState<number | null>(null);

  const toggleProject = (index: number) => {
    setExpandedProject(expandedProject === index ? null : index);
  };

  const toggleService = (index: number) => {
    setExpandedService(expandedService === index ? null : index);
  };

  return (
    <div className="bg-stone-50 text-stone-900 min-h-screen font-sans">
      <header className="sticky top-0 z-30 bg-stone-50/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <a href="#" className="font-medium tracking-tight">
            {content.hero.headline.split(" ")[0]}
          </a>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-500">
            <a href="#about" className="hover:text-stone-900 transition-colors">About</a>
            <a href="#services" className="hover:text-stone-900 transition-colors">Services</a>
            <a href="#work" className="hover:text-stone-900 transition-colors">Work</a>
            <a href="#contact" className="hover:text-stone-900 transition-colors">Contact</a>
          </nav>
          <ThemeSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-20 space-y-32">
        <section className="pt-10">
          <AnimateIn from="none" duration={0.8}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-stone-900 max-w-3xl leading-[1.1]">
              {content.hero.headline}
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.2}>
            <p className="mt-8 text-xl text-stone-500 max-w-2xl leading-relaxed">
              {content.hero.subheadline}
            </p>
          </AnimateIn>
          <AnimateIn delay={0.3}>
            <div className="mt-10">
              <Button asChild variant="outline" className="rounded-none px-6 h-12 text-sm font-medium border-stone-300 hover:bg-stone-900 hover:text-stone-50 transition-colors group">
                <a href="#contact">
                  {content.hero.ctaText}
                  <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
          </AnimateIn>
        </section>

        <section id="about" className="max-w-2xl">
          <AnimateIn>
            <h2 className="text-sm font-medium text-stone-400 mb-6">About</h2>
            <p className="text-xl sm:text-2xl font-normal leading-relaxed text-stone-800">
              {content.about.paragraph}
            </p>
          </AnimateIn>
        </section>

        <section id="services" className="max-w-4xl">
          <AnimateIn>
            <h2 className="text-sm font-medium text-stone-400 mb-8">Services</h2>
          </AnimateIn>

          <div className="border-t border-stone-200">
            {content.services.map((service, i) => (
              <StaggerItem key={i}>
                <motion.div initial={false}>
                  <motion.button
                    onClick={() => toggleService(i)}
                    className="w-full flex items-center justify-between py-6 border-b border-stone-200 text-left hover:text-stone-600 transition-colors"
                  >
                    <span className="text-lg sm:text-xl font-medium">
                      {service.title}
                    </span>
                    <AnimatePresence mode="wait">
                      {expandedService === i ? (
                        <motion.div
                          key="minus"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <MinusIcon className="size-5 text-stone-400" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="plus"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <PlusIcon className="size-5 text-stone-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  <AnimatePresence>
                    {expandedService === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-8 pt-4 pr-12">
                          <p className="text-stone-500 leading-relaxed text-lg max-w-2xl">
                            {service.description}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </StaggerItem>
            ))}
          </div>
        </section>

        <section id="work">
          <AnimateIn>
            <h2 className="text-sm font-medium text-stone-400 mb-8">Selected Work</h2>
          </AnimateIn>

          <div className="border-t border-stone-200">
            {content.projects.map((project, i) => (
              <StaggerItem key={i}>
                <motion.div initial={false}>
                  <motion.button
                    onClick={() => toggleProject(i)}
                    className="w-full flex items-center justify-between py-8 border-b border-stone-200 text-left hover:bg-stone-100/50 transition-colors px-4 -mx-4"
                  >
                    <span className="text-xl sm:text-2xl font-medium">
                      {project.title}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedProject === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDownIcon className="size-5 text-stone-400" />
                    </motion.div>
                  </motion.button>
                  <AnimatePresence>
                    {expandedProject === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="py-8 px-4 -mx-4 border-b border-stone-200 bg-stone-100/50">
                          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                            <div>
                              <p className="text-stone-600 leading-relaxed text-lg">
                                {project.description}
                              </p>
                            </div>
                            <div>
                              <div className="inline-block px-4 py-2 bg-white border border-stone-200 text-sm font-medium text-stone-700">
                                Outcome: {project.result}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </StaggerItem>
            ))}
          </div>
        </section>

        <section id="contact" className="py-20">
          <AnimateIn>
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-medium text-stone-900 mb-6">
                {content.cta.headline}
              </h2>
              <p className="text-stone-500 text-lg leading-relaxed mb-8">
                {content.cta.subtext}
              </p>
              <Button asChild variant="outline" className="rounded-none px-8 h-12 font-medium border-stone-300 hover:bg-stone-900 hover:text-stone-50 transition-colors group">
                <a href="#contact">
                  {content.hero.ctaText}
                  <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
          </AnimateIn>
        </section>
      </main>

      <footer className="border-t border-stone-200 py-8 mt-20">
        <div className="mx-auto max-w-5xl px-6 flex items-center justify-between text-sm text-stone-500">
          <span>© {new Date().getFullYear()}</span>
          <div className="flex items-center gap-4">
            <SocialLinks socialLinks={content.socialLinks} />
            <a href="#" className="hover:text-stone-900 transition-colors">Back to top</a>
          </div>
        </div>
      </footer>
    </div>
  );
}