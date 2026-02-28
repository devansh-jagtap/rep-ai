"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { isSectionVisible, mergeVisibleSections } from "@/lib/portfolio/section-registry";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { MobileMenu } from "@/components/portfolio/mobile-menu";
import { DesktopNav } from "@/components/portfolio/desktop-nav";
import { ArrowRightIcon, XIcon, Grid3X3Icon, ListIcon, LayersIcon } from "lucide-react";
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

type ViewMode = "grid" | "list" | "masonry";

export function InteractiveTemplate({ content }: { content: PortfolioContent }) {
  const visibleSections = mergeVisibleSections(content.visibleSections);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const openProject = (index: number) => {
    setSelectedProject(index);
    setIsPanelOpen(true);
  };

  const closeProject = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  useEffect(() => {
    if (isPanelOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isPanelOpen]);

  return (
    <div className="bg-background text-foreground min-h-screen font-sans">
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="font-semibold tracking-wide">Interactive</a>
          <DesktopNav visibleSections={visibleSections} />
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <MobileMenu visibleSections={visibleSections} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24 space-y-32">
        {isSectionVisible(visibleSections, "hero") && (
          <section className="space-y-8 max-w-4xl pt-10">
            <AnimateIn from="none" duration={0.8}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-balance leading-[1.1]">
                {content.hero.headline}
              </h1>
            </AnimateIn>
            <AnimateIn delay={0.1}>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl text-balance leading-relaxed">
                {content.hero.subheadline}
              </p>
            </AnimateIn>
            <AnimateIn delay={0.2}>
              <div className="flex flex-wrap items-center gap-4 pt-6">
                <Button asChild className="h-12 px-8 text-base font-medium group">
                  <a href={isSectionVisible(visibleSections, "cta") ? "#contact" : "#"}>
                    {content.hero.ctaText}
                    <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
                {isSectionVisible(visibleSections, "projects") && (
                  <Button asChild variant="secondary" className="h-12 px-8 text-base font-medium">
                    <a href="#work">View Work</a>
                  </Button>
                )}
              </div>
            </AnimateIn>
          </section>
        )}

        {isSectionVisible(visibleSections, "about") && (
          <section id="about" className="space-y-8 max-w-3xl pt-10">
            <AnimateIn>
              <div className="flex items-end justify-between border-b border-border/50 pb-4 mb-8">
                <h2 className="text-2xl font-semibold">About</h2>
              </div>
              <p className="text-xl sm:text-2xl leading-relaxed text-balance text-muted-foreground">
                {content.about.paragraph}
              </p>
            </AnimateIn>
          </section>
        )}

        {isSectionVisible(visibleSections, "services") && content.services && content.services.length > 0 && (
          <section id="services" className="space-y-12">
            <AnimateIn>
              <div className="flex items-end justify-between border-b border-border/50 pb-4">
                <h2 className="text-2xl font-semibold">Services</h2>
              </div>
            </AnimateIn>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {content.services.map((service, i) => (
                <StaggerItem key={i}>
                  <div className="p-6 rounded-xl bg-muted/40 border border-border/50 transition-colors hover:bg-muted/60">
                    <div className="text-sm font-medium text-muted-foreground mb-3">0{i + 1}</div>
                    <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {service.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </section>
        )}

        {isSectionVisible(visibleSections, "projects") && content.projects && content.projects.length > 0 && (
          <section id="work" className="space-y-10">
            <AnimateIn>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 border-b border-border/50 pb-4">
                <h2 className="text-2xl font-semibold">Selected Projects</h2>
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded transition-all ${viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Grid3X3Icon className="size-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded transition-all ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <ListIcon className="size-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("masonry")}
                    className={`p-1.5 rounded transition-all ${viewMode === "masonry" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <LayersIcon className="size-4" />
                  </button>
                </div>
              </div>
            </AnimateIn>

            <AnimatePresence mode="wait">
              {viewMode === "grid" && (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {content.projects.map((project, i) => (
                    <StaggerItem key={i}>
                      <button
                        onClick={() => openProject(i)}
                        className="group relative w-full text-left flex flex-col gap-4"
                      >
                        <div className="aspect-[4/3] bg-muted/40 rounded-lg flex items-center justify-center transition-colors group-hover:bg-muted/60 w-full">
                          <span className="text-4xl font-bold text-muted-foreground/30">{i + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                      </button>
                    </StaggerItem>
                  ))}
                </motion.div>
              )}

              {viewMode === "list" && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {content.projects.map((project, i) => (
                    <StaggerItem key={i}>
                      <button
                        onClick={() => openProject(i)}
                        className="group w-full text-left"
                      >
                        <Card className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 transition-colors hover:bg-muted/30 border-border/50 shadow-none">
                          <div className="shrink-0 w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                            <span className="font-bold text-muted-foreground">{i + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                              {project.title}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate mt-1">{project.description}</p>
                          </div>
                          <div className="shrink-0 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            View details
                          </div>
                        </Card>
                      </button>
                    </StaggerItem>
                  ))}
                </motion.div>
              )}

              {viewMode === "masonry" && (
                <motion.div
                  key="masonry"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
                >
                  {content.projects.map((project, i) => (
                    <StaggerItem key={i}>
                      <button
                        onClick={() => openProject(i)}
                        className="group relative w-full text-left break-inside-avoid flex flex-col gap-3"
                      >
                        <div className={`bg-muted/40 rounded-lg flex items-center justify-center transition-colors group-hover:bg-muted/60 ${i % 2 === 0 ? "aspect-square" : "aspect-[3/4]"}`}>
                          <span className="text-5xl font-bold text-muted-foreground/30">{project.title.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">{project.result}</p>
                        </div>
                      </button>
                    </StaggerItem>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {isSectionVisible(visibleSections, "products") && content.products && content.products.length > 0 && (
          <section id="products" className="space-y-12 border-t border-border/50 pt-16">
            <AnimateIn>
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-8">
                <h2 className="text-2xl font-semibold">Products</h2>
                <span className="text-sm text-muted-foreground">{content.products.length} Items</span>
              </div>
            </AnimateIn>

            <StaggerChildren stagger={0.1} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.products.map((product, i) => (
                <StaggerItem key={i}>
                  <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/50 group">
                    {product.image && (
                      <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-grow bg-card">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{product.title}</h3>
                        <span className="text-sm font-medium bg-foreground text-background px-3 py-1 rounded-full">{product.price}</span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">{product.description}</p>
                      {product.url && (
                        <div className="pt-4 mt-auto border-t border-border/50">
                          <Button variant="outline" className="w-full justify-between group/btn" asChild>
                            <a href={product.url} target="_blank" rel="noopener noreferrer">
                              View Details
                              <ArrowRightIcon className="size-4 transition-transform group-hover/btn:translate-x-1" />
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>
        )}

        {isSectionVisible(visibleSections, "history") && content.history && content.history.length > 0 && (
          <section id="history" className="space-y-12">
            <AnimateIn>
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-8">
                <h2 className="text-2xl font-semibold">Experience</h2>
              </div>
            </AnimateIn>

            <div className="space-y-8 pl-4 border-l-2 border-primary/20">
              {content.history.map((item, i) => (
                <AnimateIn key={i} from="bottom" delay={i * 0.1}>
                  <div className="relative pl-6">
                    <div className="absolute -left-[31px] top-1.5 size-5 rounded-full bg-background border-4 border-primary"></div>
                    <div className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground mb-3">{item.period}</div>
                    <h3 className="text-xl font-semibold text-foreground">{item.role}</h3>
                    <p className="text-base text-primary font-medium mb-3">{item.company}</p>
                    <p className="text-muted-foreground leading-relaxed max-w-3xl">{item.description}</p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </section>
        )}

        {isSectionVisible(visibleSections, "testimonials") && content.testimonials && content.testimonials.length > 0 && (
          <section id="testimonials" className="space-y-12">
            <AnimateIn>
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-8">
                <h2 className="text-2xl font-semibold">Feedback</h2>
              </div>
            </AnimateIn>

            <StaggerChildren stagger={0.1} className="grid md:grid-cols-2 gap-6">
              {content.testimonials.map((t, i) => (
                <StaggerItem key={i}>
                  <Card className="p-8 h-full flex flex-col bg-muted/20 border-border/50 hover:bg-muted/40 transition-colors">
                    <svg className="size-8 text-primary/30 mb-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <p className="text-xl text-foreground/90 leading-relaxed font-medium mb-8 flex-grow">"{t.quote}"</p>
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {t.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{t.author}</p>
                        {t.role && <p className="text-sm text-muted-foreground">{t.role}</p>}
                      </div>
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>
        )}

        {isSectionVisible(visibleSections, "faq") && content.faq && content.faq.length > 0 && (
          <section id="faq" className="space-y-12">
            <AnimateIn>
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-8">
                <h2 className="text-2xl font-semibold">FAQ</h2>
              </div>
            </AnimateIn>

            <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
              {content.faq.map((f, i) => (
                <AnimateIn key={i} from="bottom" delay={i * 0.1}>
                  <Card className="p-6 h-full bg-background hover:border-primary/50 transition-colors">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex gap-3">
                      <span className="text-primary font-bold">Q.</span>
                      {f.question}
                    </h3>
                    <div className="pl-6 text-muted-foreground leading-relaxed text-sm">
                      {f.answer}
                    </div>
                  </Card>
                </AnimateIn>
              ))}
            </div>
          </section>
        )}

        {isSectionVisible(visibleSections, "gallery") && content.gallery && content.gallery.length > 0 && (
          <section id="gallery" className="space-y-12">
            <AnimateIn>
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-8">
                <h2 className="text-2xl font-semibold">Gallery</h2>
              </div>
            </AnimateIn>

            <StaggerChildren stagger={0.1} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {content.gallery.map((g, i) => (
                <StaggerItem key={i}>
                  <div className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
                    <img
                      src={g.url}
                      alt={g.caption}
                      className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-transform duration-500 group-hover:scale-105"
                    />
                    {g.caption && (
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center backdrop-blur-sm">
                        <p className="font-medium text-foreground">{g.caption}</p>
                      </div>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>
        )}

        {isSectionVisible(visibleSections, "cta") && (
          <section id="contact" className="pt-12 border-t border-border/50">
            <AnimateIn>
              <div className="max-w-2xl space-y-8">
                <h2 className="text-4xl sm:text-5xl font-semibold text-balance tracking-tight">
                  {content.cta.headline}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed text-balance">
                  {content.cta.subtext}
                </p>
                <div className="pt-4">
                  <Button asChild size="lg" className="h-12 px-8 group">
                    <a href="#contact">
                      {content.hero.ctaText}
                      <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </AnimateIn>
          </section>
        )}
      </div>

      <AnimatePresence>
        {isPanelOpen && selectedProject !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex justify-end"
            onClick={closeProject}
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-xl h-full bg-background border-l border-border shadow-2xl overflow-y-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-background/90 backdrop-blur border-b border-border/50 p-4 flex items-center justify-between z-10">
                <span className="font-medium text-sm text-muted-foreground">Project Details</span>
                <button
                  onClick={closeProject}
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <XIcon className="size-5" />
                </button>
              </div>

              <div className="p-6 sm:p-10 space-y-10 flex-1">
                <div className="aspect-[16/9] bg-muted rounded-xl flex items-center justify-center">
                  <span className="text-6xl font-bold text-muted-foreground/30">
                    {selectedProject + 1}
                  </span>
                </div>

                <div>
                  <h2 className="text-3xl font-semibold mb-4">
                    {content.projects[selectedProject].title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {content.projects[selectedProject].description}
                  </p>
                </div>

                <div className="p-6 bg-muted/40 rounded-xl">
                  <h3 className="text-sm font-medium text-foreground mb-2">Result</h3>
                  <p className="text-muted-foreground">{content.projects[selectedProject].result}</p>
                </div>
              </div>

              <div className="border-t border-border/50 p-6 flex items-center justify-between bg-muted/10">
                <button
                  onClick={() => setSelectedProject((selectedProject - 1 + content.projects.length) % content.projects.length)}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  ← Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  {selectedProject + 1} of {content.projects.length}
                </span>
                <button
                  onClick={() => setSelectedProject((selectedProject + 1) % content.projects.length)}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Next →
                </button>
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