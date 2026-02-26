"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ArrowRightIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { AnimateIn, StaggerChildren, StaggerItem } from "@/components/animate-in";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
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

export function GalleryTemplate({ content }: { content: PortfolioContent }) {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const openProject = (index: number) => {
    setSelectedProject(index);
    setIsGalleryOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeProject = () => {
    setIsGalleryOpen(false);
    document.body.style.overflow = "";
    setTimeout(() => setSelectedProject(null), 300);
  };

  const goToProject = (direction: "prev" | "next") => {
    if (selectedProject === null) return;
    const newIndex = direction === "next"
      ? (selectedProject + 1) % content.projects.length
      : (selectedProject - 1 + content.projects.length) % content.projects.length;
    setSelectedProject(newIndex);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGalleryOpen) return;
      if (e.key === "Escape") closeProject();
      if (e.key === "ArrowLeft") goToProject("prev");
      if (e.key === "ArrowRight") goToProject("next");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGalleryOpen, selectedProject]);

  return (
    <div className="bg-background text-foreground min-h-screen font-sans">
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide">Gallery</span>
          </a>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#work" className="text-muted-foreground hover:text-foreground transition-colors">Work</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </nav>
          <ThemeSwitcher />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24 space-y-32">
        <section className="space-y-8 max-w-4xl pt-8 sm:pt-16">
          <AnimateIn from="bottom" duration={0.8}>
            <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight text-balance leading-[1.1]">
              {content.hero.headline}
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.15}>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
              {content.hero.subheadline}
            </p>
          </AnimateIn>
          <AnimateIn delay={0.3}>
            <div className="pt-4">
              <Button asChild size="lg" className="rounded-none px-8 h-12 text-base font-medium group">
                <a href="#contact">
                  {content.hero.ctaText}
                  <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
          </AnimateIn>
        </section>

        <section id="about" className="max-w-3xl">
          <AnimateIn>
            <p className="text-sm font-medium text-muted-foreground mb-4">About</p>
            <p className="text-2xl sm:text-3xl font-medium leading-relaxed text-balance">
              {content.about.paragraph}
            </p>
          </AnimateIn>
        </section>

        <section id="work" className="space-y-12">
          <AnimateIn>
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-2xl font-semibold">Selected Work</h2>
              <span className="text-sm text-muted-foreground">{content.projects.length} Projects</span>
            </div>
          </AnimateIn>

          <StaggerChildren stagger={0.1} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.projects.map((project, i) => (
              <StaggerItem key={i}>
                <button
                  onClick={() => openProject(i)}
                  className="group relative w-full text-left aspect-square bg-muted/30 overflow-hidden block"
                >
                  <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
                    <span className="text-muted-foreground/30 text-6xl font-bold">
                      {i + 1}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
                    <h3 className="text-xl font-semibold text-foreground translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </button>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>

        <section id="contact" className="py-24 border-t border-border/50">
          <AnimateIn>
            <div className="max-w-2xl space-y-6">
              <h2 className="text-4xl sm:text-5xl font-semibold text-balance tracking-tight">
                {content.cta.headline}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl text-balance">
                {content.cta.subtext}
              </p>
              <div className="pt-6">
                <Button asChild size="lg" className="rounded-none px-8 h-12 font-medium group">
                  <a href="#contact">
                    {content.hero.ctaText}
                    <ArrowRightIcon className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </div>
            </div>
          </AnimateIn>
        </section>
      </div>

      <AnimatePresence>
        {isGalleryOpen && selectedProject !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
            onClick={closeProject}
          >
            <button
              onClick={(e) => { e.stopPropagation(); closeProject(); }}
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <XIcon className="size-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); goToProject("prev"); }}
              className="absolute left-4 sm:left-8 p-3 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <ChevronLeftIcon className="size-8" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); goToProject("next"); }}
              className="absolute right-4 sm:right-8 p-3 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <ChevronRightIcon className="size-8" />
            </button>

            <motion.div
              key={selectedProject}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl w-full mx-16"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="aspect-square bg-muted/30 flex items-center justify-center relative">
                   <span className="text-muted-foreground/30 text-8xl font-bold">
                    {selectedProject + 1}
                  </span>
                </div>
                <div className="space-y-6">
                  <h3 className="text-3xl sm:text-4xl font-semibold">
                    {content.projects[selectedProject].title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {content.projects[selectedProject].description}
                  </p>
                  <div className="pt-6 border-t border-border/50">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Outcome</p>
                    <p className="text-foreground">{content.projects[selectedProject].result}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t py-8 mt-12">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {content.hero.headline}</p>
          <div className="flex items-center gap-4">
            <SocialLinks socialLinks={content.socialLinks} />
            <ThemeSwitcher />
          </div>
        </div>
      </footer>
    </div>
  );
}