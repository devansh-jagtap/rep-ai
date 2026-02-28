"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { isSectionVisible, mergeVisibleSections } from "@/lib/portfolio/section-registry";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { MobileMenu } from "@/components/portfolio/mobile-menu";
import { DesktopNav } from "@/components/portfolio/desktop-nav";
import { ArrowUpRightIcon } from "lucide-react";
import { AnimateIn, StaggerChildren, StaggerItem } from "@/components/animate-in";
import { motion } from "motion/react";
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
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 transition-colors"
            aria-label={link.platform}
          >
            <Icon className="size-5" />
          </a>
        );
      })}
    </div>
  );
}

export function EditorialTemplate({ content }: { content: PortfolioContent }) {
  const visibleSections = mergeVisibleSections(content.visibleSections);

  return (
    <div className="bg-[#fcfbf9] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-screen selection:bg-zinc-900 selection:text-[#fcfbf9] font-sans">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-12 md:py-20 space-y-24">
        {/* Header / TOC */}
        <header className="border-b border-zinc-300 dark:border-zinc-800 pb-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-sm font-medium tracking-widest uppercase">Folio.</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 tracking-wider">Vol. 1</span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 tracking-widest uppercase">
              A selected index of work & expertise
            </div>
          </div>
          <DesktopNav visibleSections={visibleSections} />
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <MobileMenu visibleSections={visibleSections} />
          </div>
        </header>

        {/* Hero Section */}
        {isSectionVisible(visibleSections, "hero") && (
          <section className="grid lg:grid-cols-[2fr_1fr] gap-12 lg:gap-24 items-end">
            <div className="space-y-8">
              <AnimateIn from="bottom" duration={1}>
                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif tracking-tight leading-[0.9] text-balance">
                  {content.hero.headline}
                </h1>
              </AnimateIn>
            </div>
            <div className="space-y-8 pb-4">
              <AnimateIn from="bottom" delay={0.2} duration={0.8}>
                <p className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-400 leading-relaxed font-serif italic">
                  {content.hero.subheadline}
                </p>
              </AnimateIn>
              <AnimateIn from="bottom" delay={0.4} duration={0.8}>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-zinc-900 dark:border-zinc-400 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-900 hover:text-white h-12 px-8 font-medium tracking-wide transition-all group"
                >
                  <a href={isSectionVisible(visibleSections, "cta") ? "#contact" : "#"}>
                    {content.hero.ctaText}
                    <ArrowUpRightIcon className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </a>
                </Button>
              </AnimateIn>
              <AnimateIn from="bottom" delay={0.55} duration={0.8}>
                <div className="border border-zinc-200 rounded-2xl bg-white/60 p-5 text-[10px] sm:text-xs leading-relaxed font-medium tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center justify-between gap-4">
                    <span>Edition</span>
                    <span className="text-zinc-900 dark:text-zinc-50">2026</span>
                  </div>
                  <div className="mt-3 h-px bg-zinc-200" />
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span>Focus</span>
                    <span className="text-zinc-900 dark:text-zinc-50">Clarity & outcomes</span>
                  </div>
                </div>
              </AnimateIn>
            </div>
          </section>
        )}

        {/* About Section - Magazine Style Multi-column */}
        {isSectionVisible(visibleSections, "about") && (
          <AnimateIn>
            <section id="prologue" className="border-y border-zinc-300 dark:border-zinc-800 py-16 md:py-24">
              <div className="grid md:grid-cols-[1fr_3fr] gap-8 md:gap-16">
                <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400 mt-2">
                  Prologue
                </h2>
                <div className="prose prose-lg prose-zinc max-w-none">
                  <p className="text-2xl md:text-3xl leading-relaxed font-serif">
                    <span className="float-left text-7xl md:text-8xl leading-none font-serif pr-4 pt-2 text-zinc-900 dark:text-zinc-50">
                      {content.about.paragraph.charAt(0)}
                    </span>
                    {content.about.paragraph.slice(1)}
                  </p>
                </div>
              </div>
            </section>
          </AnimateIn>
        )}

        {/* Services Section */}
        {isSectionVisible(visibleSections, "services") && content.services && content.services.length > 0 && (
          <section id="expertise" className="space-y-16">
            <AnimateIn>
              <div className="flex items-center gap-6">
                <h2 className="text-4xl md:text-5xl font-serif tracking-tight">Expertise</h2>
                <div className="h-px bg-zinc-300 flex-1 mt-2" />
              </div>
            </AnimateIn>

            <StaggerChildren stagger={0.15} className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
              {content.services.map((service, i) => (
                <StaggerItem key={i} from="bottom">
                  <article className="space-y-4 group cursor-pointer">
                    <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 border-b border-zinc-200 pb-4 mb-6 group-hover:text-zinc-900 group-hover:border-zinc-900 transition-all duration-300">
                      No. {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="text-2xl font-serif tracking-tight group-hover:italic transition-all duration-300 group-hover:translate-x-2">
                      {service.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base group-hover:text-zinc-900 transition-colors duration-300">
                      {service.description}
                    </p>
                  </article>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>
        )}

        {/* Projects Section */}
        {isSectionVisible(visibleSections, "projects") && content.projects && content.projects.length > 0 && (
          <section id="index" className="space-y-16 pt-6">
            <AnimateIn>
              <div className="flex flex-row-reverse items-center gap-6">
                <h2 className="text-4xl md:text-5xl font-serif tracking-tight">Index</h2>
                <div className="h-px bg-zinc-300 flex-1 mt-2" />
              </div>
            </AnimateIn>

            <div className="space-y-0">
              {content.projects.map((project, i) => (
                <AnimateIn key={i} from="bottom" delay={i * 0.1}>
                  <div className="group grid md:grid-cols-[1fr_2fr_1fr] gap-8 md:gap-12 items-center py-12 border-t border-zinc-200 hover:bg-zinc-50 transition-colors px-6 -mx-6">
                    <h3 className="text-3xl md:text-4xl font-serif tracking-tight group-hover:italic transition-all duration-300 group-hover:translate-x-2">
                      {project.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg group-hover:text-zinc-900 transition-colors duration-300">
                      {project.description}
                    </p>
                    <div className="flex justify-end mt-4 md:mt-0">
                      <div className="border border-zinc-200 rounded-[2rem] p-5 text-[10px] sm:text-xs leading-relaxed font-medium tracking-widest uppercase text-zinc-500 dark:text-zinc-400 bg-white max-w-[260px] text-center shadow-sm group-hover:border-zinc-400 group-hover:shadow-md transition-all duration-300">
                        {project.result}
                      </div>
                    </div>
                  </div>
                </AnimateIn>
              ))}
              <div className="border-t border-zinc-200" />
            </div>
          </section>
        )}

        {/* Products Section */}
        {isSectionVisible(visibleSections, "products") && content.products && content.products.length > 0 && (
          <section id="products" className="space-y-16 pt-6">
            <AnimateIn>
              <div className="flex items-center gap-6">
                <h2 className="text-4xl md:text-5xl font-serif tracking-tight">Products</h2>
                <div className="h-px bg-zinc-300 flex-1 mt-2" />
              </div>
            </AnimateIn>

            <StaggerChildren stagger={0.15} className="grid md:grid-cols-2 gap-x-12 gap-y-16">
              {content.products.map((product, i) => (
                <StaggerItem key={i} from="bottom">
                  <div className="group space-y-6">
                    {product.image && (
                      <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-100 relative">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-sm font-medium border border-zinc-200">
                          {product.price}
                        </div>
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="text-xs font-mono text-zinc-400 dark:text-zinc-500 border-b border-zinc-200 pb-2 flex justify-between">
                        <span>No. {String(i + 1).padStart(2, "0")}</span>
                        {product.url && (
                          <a href={product.url} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors flex items-center">
                            View <ArrowUpRightIcon className="ml-1 size-3" />
                          </a>
                        )}
                      </div>
                      <h3 className="text-2xl font-serif tracking-tight group-hover:italic transition-all duration-300">
                        {product.title}
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>
        )}

        {/* History Section */}
        {isSectionVisible(visibleSections, "history") && content.history && content.history.length > 0 && (
          <section id="history" className="space-y-16 pt-6">
            <AnimateIn>
              <div className="flex flex-row-reverse items-center gap-6">
                <h2 className="text-4xl md:text-5xl font-serif tracking-tight">History</h2>
                <div className="h-px bg-zinc-300 flex-1 mt-2" />
              </div>
            </AnimateIn>

            <div className="space-y-0">
              {content.history.map((item, i) => (
                <AnimateIn key={i} from="bottom" delay={i * 0.1}>
                  <div className="grid md:grid-cols-[1fr_3fr] gap-8 md:gap-12 py-12 border-t border-zinc-200">
                    <div>
                      <span className="text-sm font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
                        {item.period}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-serif tracking-tight">
                        {item.role}
                      </h3>
                      <p className="text-xl text-zinc-800 dark:text-zinc-200 italic font-serif">
                        {item.company}
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg max-w-3xl">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </AnimateIn>
              ))}
              <div className="border-t border-zinc-200" />
            </div>
          </section>
        )}

        {/* Testimonials */}
        {isSectionVisible(visibleSections, "testimonials") && content.testimonials && content.testimonials.length > 0 && (
          <section id="testimonials" className="space-y-16 pt-6">
            <AnimateIn>
              <div className="flex items-center justify-center gap-6">
                <div className="h-px bg-zinc-300 flex-1 mt-2" />
                <h2 className="text-4xl md:text-5xl font-serif tracking-tight text-center">Feedback</h2>
                <div className="h-px bg-zinc-300 flex-1 mt-2" />
              </div>
            </AnimateIn>

            <StaggerChildren stagger={0.15} className="grid md:grid-cols-2 gap-x-12 gap-y-16">
              {content.testimonials.map((t, i) => (
                <StaggerItem key={i} from="bottom">
                  <blockquote className="space-y-6">
                    <p className="text-2xl md:text-3xl leading-relaxed font-serif italic text-zinc-800 dark:text-zinc-200">
                      "{t.quote}"
                    </p>
                    <footer className="flex items-center gap-4">
                      <div className="h-px w-8 bg-zinc-400" />
                      <div>
                        <span className="block font-medium text-zinc-900 dark:text-zinc-50">{t.author}</span>
                        {t.role && <span className="block text-sm text-zinc-500 dark:text-zinc-400">{t.role}</span>}
                      </div>
                    </footer>
                  </blockquote>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>
        )}

        {/* FAQ Section */}
        {isSectionVisible(visibleSections, "faq") && content.faq && content.faq.length > 0 && (
          <section id="faq" className="space-y-16 pt-6">
            <AnimateIn>
              <div className="flex flex-row-reverse items-center gap-6">
                <h2 className="text-4xl md:text-5xl font-serif tracking-tight">Questions</h2>
                <div className="h-px bg-zinc-300 flex-1 mt-2" />
              </div>
            </AnimateIn>

            <div className="space-y-0 max-w-4xl ml-auto">
              {content.faq.map((f, i) => (
                <AnimateIn key={i} from="bottom" delay={i * 0.1}>
                  <div className="py-8 border-t border-zinc-200">
                    <h3 className="text-2xl font-serif tracking-tight mb-4 text-zinc-900 dark:text-zinc-50">
                      {f.question}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                      {f.answer}
                    </p>
                  </div>
                </AnimateIn>
              ))}
              <div className="border-t border-zinc-200" />
            </div>
          </section>
        )}

        {/* Gallery Section */}
        {isSectionVisible(visibleSections, "gallery") && content.gallery && content.gallery.length > 0 && (
          <section id="gallery" className="space-y-16 pt-6">
            <AnimateIn>
              <div className="flex items-center gap-6">
                <h2 className="text-4xl md:text-5xl font-serif tracking-tight">Gallery</h2>
                <div className="h-px bg-zinc-300 flex-1 mt-2" />
              </div>
            </AnimateIn>

            <StaggerChildren stagger={0.15} className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {content.gallery.map((g, i) => (
                <StaggerItem key={i} from="bottom">
                  <div className="group relative aspect-[3/4] overflow-hidden bg-zinc-100">
                    <img
                      src={g.url}
                      alt={g.caption}
                      className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                    {g.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-900/80 to-transparent p-6 pt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-sm font-medium tracking-wide">{g.caption}</p>
                      </div>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>
        )}

        {/* CTA Section */}
        {isSectionVisible(visibleSections, "cta") && (
          <AnimateIn duration={1}>
            <section id="contact" className="bg-zinc-900 text-zinc-50 px-6 py-24 sm:px-16 sm:py-32 rounded-2xl md:rounded-[3rem] text-center space-y-12 my-16">
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-serif tracking-tight max-w-3xl mx-auto leading-tight text-balance">
                {content.cta.headline}
              </h2>
              <p className="text-xl text-zinc-400 dark:text-zinc-500 font-serif italic max-w-2xl mx-auto">
                {content.cta.subtext}
              </p>
              <div className="pt-8">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-zinc-900 dark:text-zinc-50 hover:bg-zinc-200 rounded-full h-14 px-10 text-sm font-bold tracking-widest uppercase group"
                >
                  <a href="#contact">
                    {content.hero.ctaText}
                    <ArrowUpRightIcon className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </a>
                </Button>
              </div>
            </section>
          </AnimateIn>
        )}

        <footer className="border-t border-zinc-200 pt-10 pb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs font-medium tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-4">
            <SocialLinks socialLinks={content.socialLinks} />
            <a href="#" className="hover:text-zinc-900 transition-colors">
              Back to top
            </a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </footer>

      </div>
    </div>
  );
}