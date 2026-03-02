"use client";

import type { PortfolioContent } from "@/lib/validation/portfolio-schema";
import { isSectionVisible, mergeVisibleSections } from "@/lib/portfolio/section-registry";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogoIcon } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { MobileMenu } from "@/components/portfolio/mobile-menu";
import { DesktopNav } from "@/components/portfolio/desktop-nav";
import { ArrowRight, Check } from "lucide-react";
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

export function LandingTemplate({ content }: { content: PortfolioContent }) {
  const visibleSections = mergeVisibleSections(content.visibleSections);

  return (
    <div className="bg-background text-foreground min-h-screen font-sans">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <a href="#" aria-label="Back to top" className="flex items-center gap-2">
            <LogoIcon uniColor className="h-auto w-auto" />
            <span className="text-sm font-medium tracking-wide">Portfolio</span>
          </a>
          <DesktopNav visibleSections={visibleSections} />
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <MobileMenu visibleSections={visibleSections} />
          </div>
        </div>
      </header>

      <main className="overflow-hidden">
        {/* Hero */}
        {isSectionVisible(visibleSections, "hero") && (
          <section className="bg-background">
            <div className="relative py-24 md:py-32">
              <div className="relative z-10 mx-auto w-full max-w-5xl px-6">
                <div className="mx-auto max-w-3xl text-center space-y-8">
                  <AnimateIn from="bottom" duration={0.8}>
                    <h1 className="text-balance font-serif text-5xl md:text-7xl font-medium tracking-tight text-foreground leading-[1.1]">
                      {content.hero.headline}
                    </h1>
                  </AnimateIn>
                  <AnimateIn delay={0.15}>
                    <p className="text-muted-foreground text-balance text-xl leading-relaxed">
                      {content.hero.subheadline}
                    </p>
                  </AnimateIn>
                  <AnimateIn delay={0.3}>
                    <div className="pt-4">
                      <Button asChild size="lg" className="h-12 px-8 text-base group">
                        <a href={isSectionVisible(visibleSections, "cta") ? "#contact" : "#"}>
                          {content.hero.ctaText}
                          <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                        </a>
                      </Button>
                    </div>
                  </AnimateIn>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* About */}
        {isSectionVisible(visibleSections, "about") && (
          <section id="about" className="bg-muted/30 py-24 border-y border-border/50">
            <div className="mx-auto max-w-5xl px-6">
              <AnimateIn>
                <div className="max-w-3xl">
                  <h2 className="text-balance font-serif text-3xl md:text-4xl font-medium text-foreground mb-6">
                    About
                  </h2>
                  <p className="text-muted-foreground text-xl leading-relaxed">
                    {content.about.paragraph}
                  </p>
                </div>
              </AnimateIn>
            </div>
          </section>
        )}

        {/* Services */}
        {isSectionVisible(visibleSections, "services") && content.services && content.services.length > 0 && (
          <section id="services" className="py-24">
            <div className="mx-auto max-w-5xl px-6">
              <AnimateIn>
                <div className="mb-16">
                  <h2 className="text-balance font-serif text-4xl font-medium text-foreground">Services</h2>
                </div>
              </AnimateIn>

              <StaggerChildren stagger={0.1} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {content.services.map((service, i) => (
                  <StaggerItem key={i}>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
                          <Check className="size-3.5 text-primary" />
                        </div>
                        <h3 className="text-foreground font-medium text-lg">{service.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </section>
        )}

        {/* Projects */}
        {isSectionVisible(visibleSections, "projects") && content.projects && content.projects.length > 0 && (
          <section id="work" className="bg-muted/30 py-24 border-y border-border/50">
            <div className="mx-auto max-w-5xl px-6">
              <AnimateIn>
                <div className="mb-16">
                  <h2 className="text-balance font-serif text-4xl font-medium text-foreground">Selected Work</h2>
                </div>
              </AnimateIn>

              <StaggerChildren stagger={0.15} className="space-y-16">
                {content.projects.map((project, i) => (
                  <StaggerItem key={i}>
                    <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-serif font-medium text-foreground">
                          {project.title}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground">
                          Outcome: <span className="text-foreground">{project.result}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                          {project.description}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </section>
        )}

        {/* Products */}
        {isSectionVisible(visibleSections, "products") && content.products && content.products.length > 0 && (
          <section id="products" className="py-24">
            <div className="mx-auto max-w-5xl px-6">
              <AnimateIn>
                <div className="mb-16">
                  <h2 className="text-balance font-serif text-4xl font-medium text-foreground">Products</h2>
                </div>
              </AnimateIn>

              <StaggerChildren stagger={0.1} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {content.products.map((product, i) => (
                  <StaggerItem key={i}>
                    <Card className="flex flex-col h-full overflow-hidden bg-background hover:shadow-lg transition-all duration-300">
                      {product.image && (
                        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-lg font-medium text-foreground">{product.title}</h3>
                          <span className="text-sm font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">{product.price}</span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">{product.description}</p>
                        {product.url && (
                          <Button variant="outline" className="w-full mt-auto" asChild>
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
            </div>
          </section>
        )}

        {/* History */}
        {isSectionVisible(visibleSections, "history") && content.history && content.history.length > 0 && (
          <section id="history" className="bg-muted/30 py-24 border-y border-border/50">
            <div className="mx-auto max-w-5xl px-6">
              <AnimateIn>
                <div className="mb-16">
                  <h2 className="text-balance font-serif text-4xl font-medium text-foreground">Experience</h2>
                </div>
              </AnimateIn>

              <div className="space-y-12">
                {content.history.map((item, i) => (
                  <AnimateIn key={i} from="bottom" delay={i * 0.1}>
                    <div className="grid md:grid-cols-[1fr_3fr] gap-6 md:gap-12 pl-4 border-l-2 border-primary/20 hover:border-primary transition-colors">
                      <div>
                        <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
                          {item.period}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-medium text-foreground mb-1">
                          {item.role}
                        </h3>
                        <p className="text-base text-foreground/80 font-medium mb-4">
                          {item.company}
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </AnimateIn>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {isSectionVisible(visibleSections, "testimonials") && content.testimonials && content.testimonials.length > 0 && (
          <section id="testimonials" className="py-24">
            <div className="mx-auto max-w-5xl px-6">
              <AnimateIn>
                <div className="mb-16">
                  <h2 className="text-balance font-serif text-4xl font-medium text-foreground text-center">Client Feedback</h2>
                </div>
              </AnimateIn>

              <StaggerChildren stagger={0.15} className="grid md:grid-cols-2 gap-8">
                {content.testimonials.map((t, i) => (
                  <StaggerItem key={i}>
                    <Card className="p-8 h-full flex flex-col bg-background/50 hover:bg-background transition-colors shadow-sm">
                      <svg className="size-8 text-primary/20 mb-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="text-lg leading-relaxed text-foreground/80 mb-8 flex-grow">"{t.quote}"</p>
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {t.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{t.author}</p>
                          {t.role && <p className="text-sm text-muted-foreground">{t.role}</p>}
                        </div>
                      </div>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </section>
        )}

        {/* FAQ */}
        {isSectionVisible(visibleSections, "faq") && content.faq && content.faq.length > 0 && (
          <section id="faq" className="bg-muted/30 py-24 border-y border-border/50">
            <div className="mx-auto max-w-3xl px-6">
              <AnimateIn>
                <div className="mb-16 text-center">
                  <h2 className="text-balance font-serif text-4xl font-medium text-foreground">Frequently Asked Questions</h2>
                </div>
              </AnimateIn>

              <div className="space-y-6">
                {content.faq.map((f, i) => (
                  <AnimateIn key={i} from="bottom" delay={i * 0.1}>
                    <Card className="p-6 bg-background">
                      <h3 className="text-lg font-medium text-foreground mb-3">{f.question}</h3>
                      <p className="text-muted-foreground leading-relaxed">{f.answer}</p>
                    </Card>
                  </AnimateIn>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery */}
        {isSectionVisible(visibleSections, "gallery") && content.gallery && content.gallery.length > 0 && (
          <section id="gallery" className="py-24">
            <div className="mx-auto max-w-5xl px-6">
              <AnimateIn>
                <div className="mb-16">
                  <h2 className="text-balance font-serif text-4xl font-medium text-foreground">Gallery</h2>
                </div>
              </AnimateIn>

              <StaggerChildren stagger={0.1} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {content.gallery.map((g, i) => (
                  <StaggerItem key={i}>
                    <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                      <img
                        src={g.url}
                        alt={g.caption}
                        className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                      />
                      {g.caption && (
                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center backdrop-blur-sm">
                          <p className="font-medium text-foreground text-sm">{g.caption}</p>
                        </div>
                      )}
                    </div>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </section>
        )}

        {/* CTA */}
        {isSectionVisible(visibleSections, "cta") && (
          <section id="contact" className="py-32">
            <div className="mx-auto max-w-5xl px-6 text-center">
              <AnimateIn>
                <div className="max-w-2xl mx-auto space-y-8">
                  <h2 className="text-balance font-serif text-4xl md:text-5xl font-medium text-foreground">
                    {content.cta.headline}
                  </h2>
                  <p className="text-muted-foreground text-xl">
                    {content.cta.subtext}
                  </p>
                  <div className="pt-6">
                    <Button asChild size="lg" className="h-14 px-10 text-base group">
                      <a href="#contact">
                        {content.hero.ctaText}
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </AnimateIn>
            </div>
          </section>
        )}

        <footer className="py-8 border-t border-border/50">
          <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {content.hero.headline}</p>
            <div className="flex items-center gap-6">
              <SocialLinks socialLinks={content.socialLinks} />
              <a href="#" className="hover:text-foreground transition-colors">Back to top</a>
              <ThemeSwitcher />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

