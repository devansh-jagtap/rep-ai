"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { isSectionVisible, mergeVisibleSections } from "@/lib/portfolio/section-registry";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LogoIcon } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { MobileMenu } from "@/components/portfolio/mobile-menu";
import { DesktopNav } from "@/components/portfolio/desktop-nav";
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

export function VeilTemplate({ content }: { content: PortfolioContent }) {
  const visibleSections = mergeVisibleSections(content.visibleSections);

  return (
    <div className="font-sans antialiased text-foreground bg-background min-h-screen">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm border-b border-border/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <a href="#" aria-label="Back to top" className="flex items-center gap-2">
            <LogoIcon uniColor className="size-5 opacity-80" />
            <span className="text-sm font-medium tracking-wide">Veil</span>
          </a>
          <DesktopNav visibleSections={visibleSections} />
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <MobileMenu visibleSections={visibleSections} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        {/* Hero */}
        {isSectionVisible(visibleSections, "hero") && (
          <section className="space-y-8 max-w-3xl pt-8 sm:pt-16">
            <AnimateIn from="bottom" duration={0.8}>
              <h1 className="text-balance font-serif text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-[1.1] text-foreground">
                {content.hero.headline}
              </h1>
            </AnimateIn>
            <AnimateIn from="bottom" delay={0.1} duration={0.8}>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl text-balance">
                {content.hero.subheadline}
              </p>
            </AnimateIn>
            <AnimateIn from="none" delay={0.2}>
              <div className="pt-6 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" variant="default" className="h-12 px-8 text-base">
                  <a href={isSectionVisible(visibleSections, "cta") ? "#contact" : "#"}>
                    {content.hero.ctaText}
                  </a>
                </Button>
                {isSectionVisible(visibleSections, "projects") && (
                  <a
                    href="#work"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                  >
                    View selected work
                  </a>
                )}
              </div>
            </AnimateIn>
          </section>
        )}

        {/* About */}
        {isSectionVisible(visibleSections, "about") && (
          <section id="about" className="mt-24 sm:mt-32">
            <AnimateIn>
              <div className="max-w-3xl">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
                  About
                </h2>
                <p className="text-xl sm:text-2xl leading-relaxed text-balance text-foreground font-serif">
                  {content.about.paragraph}
                </p>
              </div>
            </AnimateIn>
          </section>
        )}

        {/* Services */}
        {isSectionVisible(visibleSections, "services") && content.services && content.services.length > 0 && (
          <section id="services" className="mt-24 sm:mt-32">
            <AnimateIn from="none">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
                Services
              </h2>
            </AnimateIn>
            <StaggerChildren stagger={0.1} className="grid sm:grid-cols-2 gap-8 lg:gap-12">
              {content.services.map((service, i) => (
                <StaggerItem key={i}>
                  <div className="space-y-3">
                    <h3 className="text-xl font-medium text-foreground">{service.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>
        )}

        {/* Projects */}
        {isSectionVisible(visibleSections, "projects") && content.projects && content.projects.length > 0 && (
          <section id="work" className="mt-24 sm:mt-32">
            <AnimateIn from="none">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
                Selected Work
              </h2>
            </AnimateIn>
            <div className="space-y-16">
              {content.projects.map((project, i) => (
                <AnimateIn key={i} delay={i * 0.1}>
                  <div className="group flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-16 border-t border-border/50 pt-8">
                    <div className="md:w-1/3 shrink-0 space-y-2">
                      <h3 className="text-2xl font-serif font-medium text-foreground">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {project.result}
                      </p>
                    </div>
                    <div className="md:w-2/3">
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        {isSectionVisible(visibleSections, "products") && content.products && content.products.length > 0 && (
          <section id="products" className="mt-24 sm:mt-32">
            <AnimateIn from="none">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
                Products
              </h2>
            </AnimateIn>
            <StaggerChildren stagger={0.1} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.products.map((product, i) => (
                <StaggerItem key={i}>
                  <Card className="flex flex-col h-full overflow-hidden bg-background border-border/50 hover:border-foreground/30 transition-colors group">
                    {product.image && (
                      <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-medium text-foreground">{product.title}</h3>
                        <span className="text-sm font-medium text-muted-foreground">{product.price}</span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">{product.description}</p>
                      {product.url && (
                        <div className="pt-4 border-t border-border/50 mt-auto">
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium group/link flex items-center text-muted-foreground hover:text-foreground transition-colors w-fit"
                          >
                            View Product
                            <ArrowRightIcon className="ml-1 size-3.5 transition-transform group-hover/link:translate-x-1" />
                          </a>
                        </div>
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
          <section id="history" className="mt-24 sm:mt-32">
            <AnimateIn from="none">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
                Experience
              </h2>
            </AnimateIn>
            <div className="space-y-12">
              {content.history.map((item, i) => (
                <AnimateIn key={i} delay={i * 0.1}>
                  <div className="flex flex-col md:flex-row gap-4 md:gap-12 lg:gap-16 border-t border-border/50 pt-8">
                    <div className="md:w-1/3 shrink-0">
                      <p className="text-sm font-medium text-muted-foreground">{item.period}</p>
                    </div>
                    <div className="md:w-2/3 space-y-2">
                      <h3 className="text-xl font-medium text-foreground">{item.role}</h3>
                      <p className="text-base text-foreground/80 font-medium mb-4">{item.company}</p>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {isSectionVisible(visibleSections, "testimonials") && content.testimonials && content.testimonials.length > 0 && (
          <section id="testimonials" className="mt-24 sm:mt-32">
            <AnimateIn from="none">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
                What Clients Say
              </h2>
            </AnimateIn>
            <StaggerChildren stagger={0.1} className="grid md:grid-cols-2 gap-8">
              {content.testimonials.map((t, i) => (
                <StaggerItem key={i}>
                  <div className="space-y-6">
                    <p className="text-2xl sm:text-3xl font-serif text-foreground leading-[1.3] text-balance">
                      "{t.quote}"
                    </p>
                    <div>
                      <p className="font-medium text-foreground">{t.author}</p>
                      {t.role && <p className="text-sm text-muted-foreground">{t.role}</p>}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>
        )}

        {/* FAQ */}
        {isSectionVisible(visibleSections, "faq") && content.faq && content.faq.length > 0 && (
          <section id="faq" className="mt-24 sm:mt-32">
            <AnimateIn from="none">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
                FAQ
              </h2>
            </AnimateIn>
            <div className="space-y-8">
              {content.faq.map((f, i) => (
                <AnimateIn key={i} delay={i * 0.1}>
                  <div className="flex flex-col md:flex-row gap-4 md:gap-12 lg:gap-16 border-t border-border/50 pt-8">
                    <div className="md:w-1/3 shrink-0">
                      <h3 className="text-lg font-medium text-foreground">{f.question}</h3>
                    </div>
                    <div className="md:w-2/3">
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {f.answer}
                      </p>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {isSectionVisible(visibleSections, "gallery") && content.gallery && content.gallery.length > 0 && (
          <section id="gallery" className="mt-24 sm:mt-32">
            <AnimateIn from="none">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
                Gallery
              </h2>
            </AnimateIn>
            <StaggerChildren stagger={0.1} className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {content.gallery.map((g, i) => (
                <StaggerItem key={i}>
                  <div className="group space-y-3">
                    <div className="aspect-[4/5] overflow-hidden bg-muted">
                      <img
                        src={g.url}
                        alt={g.caption}
                        className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    {g.caption && (
                      <p className="text-sm text-muted-foreground">{g.caption}</p>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>
        )}

        {/* CTA */}
        {isSectionVisible(visibleSections, "cta") && (
          <section id="contact" className="mt-24 sm:mt-32">
            <AnimateIn>
              <div className="py-16 sm:py-24 border-y border-border/50">
                <div className="max-w-2xl space-y-8">
                  <h2 className="text-balance font-serif text-4xl sm:text-5xl font-medium tracking-tight text-foreground">
                    {content.cta.headline}
                  </h2>
                  <p className="text-xl text-muted-foreground leading-relaxed text-balance">
                    {content.cta.subtext}
                  </p>
                  <div className="pt-4">
                    <Button asChild size="lg" className="h-14 px-10 text-base group">
                      <a href="#contact">
                        {content.hero.ctaText}
                        <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </AnimateIn>
          </section>
        )}

        <footer className="mt-16 flex items-center justify-between gap-4 text-sm text-muted-foreground pb-8">
          <span>&copy; {new Date().getFullYear()}</span>
          <div className="flex items-center gap-4">
            <SocialLinks socialLinks={content.socialLinks} />
            <a href="#" className="hover:text-foreground transition-colors">
              Back to top
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
