"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { isSectionVisible, mergeVisibleSections } from "@/lib/portfolio/section-registry";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { MobileMenu } from "@/components/portfolio/mobile-menu";
import { DesktopNav } from "@/components/portfolio/desktop-nav";
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
            className="text-stone-500 dark:text-stone-400 hover:text-stone-900 transition-colors"
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

  const visibleSections = mergeVisibleSections(content.visibleSections);

  return (
    <div className="bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-50 min-h-screen font-sans">
      <header className="sticky top-0 z-30 bg-stone-50/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <a href="#" className="flex items-center gap-2 font-medium tracking-tight">
            <img src="/ai-logo.png" alt="Logo" className="size-6 dark:invert" />
            <span className="hidden sm:inline-block">{content.hero.headline.split(" ")[0]}</span>
          </a>
          <DesktopNav visibleSections={visibleSections} />
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <MobileMenu visibleSections={visibleSections} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-20 space-y-32">
        {/* Hero */}
        {isSectionVisible(visibleSections, "hero") && (
          <section className="pt-10">
            <AnimateIn from="none" duration={0.8}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-stone-900 dark:text-stone-50 max-w-3xl leading-[1.1]">
                {content.hero.headline}
              </h1>
            </AnimateIn>
            <AnimateIn delay={0.2}>
              <p className="mt-8 text-xl text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
                {content.hero.subheadline}
              </p>
            </AnimateIn>
            <AnimateIn delay={0.3}>
              <div className="mt-10">
                <Button asChild variant="outline" className="rounded-none px-6 h-12 text-sm font-medium border-stone-300 dark:border-stone-700 hover:bg-stone-900 hover:text-stone-50 transition-colors group">
                  <a href="#contact">
                    {content.hero.ctaText}
                    <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </div>
            </AnimateIn>
          </section>
        )}

        {/* About */}
        {isSectionVisible(visibleSections, "about") && (
          <section id="about" className="max-w-2xl">
            <AnimateIn>
              <h2 className="text-sm font-medium text-stone-400 dark:text-stone-500 mb-6">About</h2>
              <p className="text-xl sm:text-2xl font-normal leading-relaxed text-stone-800 dark:text-stone-200">
                {content.about.paragraph}
              </p>
            </AnimateIn>
          </section>
        )}

        {/* Services */}
        {isSectionVisible(visibleSections, "services") && (content.services?.length > 0) && (
          <section id="services" className="max-w-4xl">
            <AnimateIn>
              <h2 className="text-sm font-medium text-stone-400 dark:text-stone-500 mb-8">Services</h2>
            </AnimateIn>

            <div className="border-t border-stone-200 dark:border-stone-800">
              {content.services.map((service, i) => (
                <StaggerItem key={i}>
                  <motion.div initial={false}>
                    <motion.button
                      onClick={() => toggleService(i)}
                      className="w-full flex items-center justify-between py-6 border-b border-stone-200 dark:border-stone-800 text-left hover:text-stone-600 transition-colors"
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
                            <MinusIcon className="size-5 text-stone-400 dark:text-stone-500" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="plus"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <PlusIcon className="size-5 text-stone-400 dark:text-stone-500" />
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
                            <p className="text-stone-500 dark:text-stone-400 leading-relaxed text-lg max-w-2xl">
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
        )}

        {/* Projects */}
        {isSectionVisible(visibleSections, "projects") && (content.projects?.length > 0) && (
          <section id="work">
            <AnimateIn>
              <h2 className="text-sm font-medium text-stone-400 dark:text-stone-500 mb-8">Selected Work</h2>
            </AnimateIn>

            <div className="border-t border-stone-200 dark:border-stone-800">
              {content.projects.map((project, i) => (
                <StaggerItem key={i}>
                  <motion.div initial={false}>
                    <motion.button
                      onClick={() => toggleProject(i)}
                      className="w-full flex items-center justify-between py-8 border-b border-stone-200 dark:border-stone-800 text-left hover:bg-stone-100/50 transition-colors px-4 -mx-4"
                    >
                      <span className="text-xl sm:text-2xl font-medium">
                        {project.title}
                      </span>
                      <motion.div
                        animate={{ rotate: expandedProject === i ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDownIcon className="size-5 text-stone-400 dark:text-stone-500" />
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
                          <div className="py-8 px-4 -mx-4 border-b border-stone-200 dark:border-stone-800 bg-stone-100/50">
                            <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                              <div>
                                <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-lg">
                                  {project.description}
                                </p>
                              </div>
                              <div>
                                <div className="inline-block px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm font-medium text-stone-700 dark:text-stone-300">
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
        )}

        {/* Products */}
        {isSectionVisible(visibleSections, "products") && content.products && content.products.length > 0 && (
          <section id="products">
            <AnimateIn>
              <h2 className="text-sm font-medium text-stone-400 dark:text-stone-500 mb-8">Products</h2>
            </AnimateIn>
            <div className="grid sm:grid-cols-2 gap-8">
              {content.products.map((product, i) => (
                <StaggerItem key={i}>
                  <div className="group border border-stone-200 dark:border-stone-800 hover:border-stone-900 transition-colors overflow-hidden flex flex-col h-full bg-white dark:bg-stone-900">
                    {product.image && (
                      <div className="aspect-[4/3] w-full relative overflow-hidden bg-stone-100 dark:bg-stone-900">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-medium tracking-tight">{product.title}</h3>
                        <span className="text-sm font-medium bg-stone-100 dark:bg-stone-900 px-2.5 py-1 text-stone-600 dark:text-stone-400 shrink-0">{product.price}</span>
                      </div>
                      <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-6 flex-grow">{product.description}</p>
                      {product.url && (
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium inline-flex items-center text-stone-900 dark:text-stone-50 hover:text-stone-600 transition-colors mt-auto w-fit"
                        >
                          View Product <ArrowRightIcon className="ml-1 size-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </section>
        )}

        {/* History */}
        {isSectionVisible(visibleSections, "history") && content.history && content.history.length > 0 && (
          <section id="history" className="max-w-4xl">
            <AnimateIn>
              <h2 className="text-sm font-medium text-stone-400 dark:text-stone-500 mb-8">Experience & History</h2>
            </AnimateIn>
            <div className="space-y-12 border-l border-stone-200 dark:border-stone-800 ml-3 pl-8">
              {content.history.map((item, i) => (
                <StaggerItem key={i}>
                  <div className="relative">
                    <div className="absolute -left-[41px] top-1.5 size-3 rounded-full border-2 border-stone-900 bg-stone-50 dark:bg-stone-950"></div>
                    <p className="text-sm font-medium text-stone-400 dark:text-stone-500 mb-2">{item.period}</p>
                    <h3 className="text-xl font-medium tracking-tight mb-1">{item.role}</h3>
                    <p className="text-lg text-stone-600 dark:text-stone-400 mb-4">{item.company}</p>
                    <p className="text-stone-500 dark:text-stone-400 leading-relaxed max-w-2xl">{item.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {isSectionVisible(visibleSections, "testimonials") && content.testimonials && content.testimonials.length > 0 && (
          <section id="testimonials">
            <AnimateIn>
              <h2 className="text-sm font-medium text-stone-400 dark:text-stone-500 mb-8">Testimonials</h2>
            </AnimateIn>
            <div className="grid sm:grid-cols-2 gap-8">
              {content.testimonials.map((t, i) => (
                <StaggerItem key={i}>
                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 h-full flex flex-col">
                    <div className="text-stone-300 dark:text-stone-600 mb-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" fill="currentColor" />
                      </svg>
                    </div>
                    <p className="text-lg text-stone-800 dark:text-stone-200 leading-relaxed italic flex-grow mb-6">"{t.quote}"</p>
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-50">{t.author}</p>
                      {t.role && <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{t.role}</p>}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {isSectionVisible(visibleSections, "faq") && content.faq && content.faq.length > 0 && (
          <section id="faq" className="max-w-3xl">
            <AnimateIn>
              <h2 className="text-sm font-medium text-stone-400 dark:text-stone-500 mb-8">Frequently Asked Questions</h2>
            </AnimateIn>
            <div className="space-y-6">
              {content.faq.map((f, i) => (
                <StaggerItem key={i}>
                  <div className="border-b border-stone-200 dark:border-stone-800 pb-6">
                    <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50 mb-3">{f.question}</h3>
                    <p className="text-stone-500 dark:text-stone-400 leading-relaxed">{f.answer}</p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {isSectionVisible(visibleSections, "gallery") && content.gallery && content.gallery.length > 0 && (
          <section id="gallery">
            <AnimateIn>
              <h2 className="text-sm font-medium text-stone-400 dark:text-stone-500 mb-8">Gallery</h2>
            </AnimateIn>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
              {content.gallery.map((g, i) => (
                <StaggerItem key={i}>
                  <div className="group relative aspect-square overflow-hidden bg-stone-100 dark:bg-stone-900">
                    <img
                      src={g.url}
                      alt={g.caption}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                    />
                    {g.caption && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <p className="text-white text-sm font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{g.caption}</p>
                      </div>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        {isSectionVisible(visibleSections, "cta") && (
          <section id="contact" className="py-20">
            <AnimateIn>
              <div className="max-w-2xl">
                <h2 className="text-3xl sm:text-4xl font-medium text-stone-900 dark:text-stone-50 mb-6">
                  {content.cta.headline}
                </h2>
                <p className="text-stone-500 dark:text-stone-400 text-lg leading-relaxed mb-8">
                  {content.cta.subtext}
                </p>
                <Button asChild variant="outline" className="rounded-none px-8 h-12 font-medium border-stone-300 dark:border-stone-700 hover:bg-stone-900 hover:text-stone-50 transition-colors group">
                  <a href="#contact">
                    {content.hero.ctaText}
                    <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </div>
            </AnimateIn>
          </section>
        )}
      </main>

      <footer className="border-t border-stone-200 dark:border-stone-800 py-8 mt-20">
        <div className="mx-auto max-w-5xl px-6 flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
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