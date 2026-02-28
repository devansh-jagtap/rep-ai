"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { isSectionVisible, mergeVisibleSections } from "@/lib/portfolio/section-registry";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { MobileMenu } from "@/components/portfolio/mobile-menu";
import { DesktopNav } from "@/components/portfolio/desktop-nav";
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
  const visibleSections = mergeVisibleSections(content.visibleSections);

  return (
    <div className="bg-background text-foreground min-h-screen font-sans">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <a href="#" aria-label="Back to top" className="flex items-center gap-3">
            <img src="/ai-logo.png" alt="Logo" className="size-6 dark:invert" />
            <span className="text-sm font-medium tracking-wide hidden sm:inline-block">Portfolio</span>
          </a>
          <DesktopNav visibleSections={visibleSections} />
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <MobileMenu visibleSections={visibleSections} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24 space-y-32">
        {/* Hero */}
        {isSectionVisible(visibleSections, "hero") && (
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
                  <a href={isSectionVisible(visibleSections, "cta") ? "#contact" : "#"}>
                    {content.hero.ctaText}
                  </a>
                </Button>
              </div>
            </AnimateIn>
          </section>
        )}

        {/* About */}
        {isSectionVisible(visibleSections, "about") && (
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
        )}

        {/* Services */}
        {isSectionVisible(visibleSections, "services") && (content.services?.length > 0) && (
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
        )}

        {/* Projects */}
        {isSectionVisible(visibleSections, "projects") && (content.projects?.length > 0) && (
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
        )}

        {/* Products */}
        {isSectionVisible(visibleSections, "products") && content.products && content.products.length > 0 && (
          <section id="products" className="space-y-12">
            <AnimateIn>
              <h2 className="text-3xl font-medium text-foreground">Products</h2>
            </AnimateIn>
            <StaggerChildren stagger={0.1} className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {content.products.map((product, i) => (
                <StaggerItem key={i}>
                  <Card className="overflow-hidden flex flex-col h-full hover:border-foreground/20 transition-colors">
                    {product.image && (
                      <div className="aspect-video w-full bg-muted overflow-hidden relative border-b">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-medium tracking-tight line-clamp-2">{product.title}</h3>
                        <span className="text-sm font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full shrink-0">
                          {product.price}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                        {product.description}
                      </p>
                      {product.url && (
                        <Button asChild variant="outline" className="w-full mt-auto">
                          <a href={product.url} target="_blank" rel="noopener noreferrer">
                            View Product
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>
        )}

        {/* History */}
        {isSectionVisible(visibleSections, "history") && content.history && content.history.length > 0 && (
          <section id="history" className="space-y-12 max-w-3xl">
            <AnimateIn>
              <h2 className="text-3xl font-medium text-foreground">History</h2>
            </AnimateIn>
            <div className="space-y-8 pl-4 border-l-2 border-primary/20">
              {content.history.map((item, i) => (
                <StaggerItem key={i}>
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1.5 size-3 rounded-full bg-background border-2 border-primary"></div>
                    <p className="text-sm font-medium text-primary mb-1">{item.period}</p>
                    <h3 className="text-xl font-medium text-foreground">{item.role}</h3>
                    <p className="text-base text-muted-foreground font-medium mb-3">{item.company}</p>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {isSectionVisible(visibleSections, "testimonials") && content.testimonials && content.testimonials.length > 0 && (
          <section id="testimonials" className="space-y-12">
            <AnimateIn>
              <h2 className="text-3xl font-medium text-foreground text-center">Testimonials</h2>
            </AnimateIn>
            <StaggerChildren stagger={0.15} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.testimonials.map((t, i) => (
                <StaggerItem key={i}>
                  <Card className="p-8 h-full flex flex-col bg-muted/30 border-none shadow-none">
                    <div className="text-primary mb-6">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" fill="currentColor" />
                      </svg>
                    </div>
                    <p className="text-lg text-foreground italic leading-relaxed flex-grow mb-6">"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {t.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{t.author}</p>
                        {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
                      </div>
                    </div>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>
        )}

        {/* FAQ */}
        {isSectionVisible(visibleSections, "faq") && content.faq && content.faq.length > 0 && (
          <section id="faq" className="space-y-12 max-w-3xl mx-auto">
            <AnimateIn>
              <h2 className="text-3xl font-medium text-foreground text-center">FAQ</h2>
            </AnimateIn>
            <div className="space-y-4">
              {content.faq.map((f, i) => (
                <StaggerItem key={i}>
                  <Card className="p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-foreground mb-2">{f.question}</h3>
                    <p className="text-muted-foreground leading-relaxed">{f.answer}</p>
                  </Card>
                </StaggerItem>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {isSectionVisible(visibleSections, "gallery") && content.gallery && content.gallery.length > 0 && (
          <section id="gallery" className="space-y-12">
            <AnimateIn>
              <h2 className="text-3xl font-medium text-foreground">Gallery</h2>
            </AnimateIn>
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {content.gallery.map((g, i) => (
                <StaggerItem key={i}>
                  <div className="break-inside-avoid relative group rounded-xl overflow-hidden bg-muted border border-border">
                    <img
                      src={g.url}
                      alt={g.caption}
                      className="w-full object-cover"
                      loading="lazy"
                    />
                    {g.caption && (
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 backdrop-blur-sm">
                        <p className="text-foreground font-medium text-center">{g.caption}</p>
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
        )}
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