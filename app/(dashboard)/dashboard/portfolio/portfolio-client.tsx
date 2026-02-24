"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Sparkles, Loader2, Globe, FileText, Briefcase, Megaphone } from "lucide-react";
import Link from "next/link";
import { usePortfolioActions } from "@/app/(dashboard)/dashboard/portfolio/_hooks/use-portfolio-actions";

interface PortfolioContent {
  hero?: { headline?: string; subheadline?: string };
  about?: { paragraph?: string };
  services?: { title: string; description: string }[];
  projects?: { title: string; description: string; result: string }[];
  cta?: { headline?: string; subtext?: string };
}

interface PortfolioClientProps {
  portfolio: {
    handle: string;
    isPublished: boolean;
    template: string;
    updatedAt: string;
  };
  content: PortfolioContent | null;
}

export function PortfolioClient({ portfolio, content }: PortfolioClientProps) {
  const {
    isPending,
    isPublished,
    isRegenerating,
    handlePublishChange,
    handleTemplateChange,
    handleRegenerate,
  } = usePortfolioActions(Boolean(content), portfolio.isPublished);

  const portfolioLink = `/${portfolio.handle}`;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Portfolio Management</h1>
        <p className="text-muted-foreground">
          Control your public profile, content, and visibility.
        </p>
      </div>

      {/* Visibility */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Visibility</CardTitle>
              <CardDescription>Control whether your portfolio is publicly accessible.</CardDescription>
            </div>
            {isPublished ? (
              <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>
            ) : (
              <Badge variant="secondary">Draft</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium leading-none">Publish Portfolio</span>
            <span className="text-sm text-muted-foreground">
              {content ? "Make your profile visible to the world" : "Generate content first to publish"}
            </span>
          </div>
          <Switch
            checked={isPublished}
            onCheckedChange={handlePublishChange}
            disabled={isPending}
          />
        </CardContent>
        <CardFooter className="bg-muted/50 border-t py-4 justify-between">
          <p className="text-sm text-muted-foreground">
            Last updated {new Date(portfolio.updatedAt).toLocaleDateString()}
          </p>
          {isPublished && (
            <Button variant="outline" size="sm" asChild>
              <Link href={portfolioLink} target="_blank">
                <ExternalLink className="size-4 mr-2" />
                View Live Site
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Design */}
      <Card>
        <CardHeader>
          <CardTitle>Design & Template</CardTitle>
          <CardDescription>Choose your portfolio layout style.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Selected Template</Label>
            <Select defaultValue={portfolio.template} onValueChange={handleTemplateChange} disabled={isPending}>
              <SelectTrigger className="w-full sm:max-w-md">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="landing">Landing</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="veil">Veil (Minimal)</SelectItem>
                <SelectItem value="bold">Bold (Dark)</SelectItem>
                <SelectItem value="editorial">Editorial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-4 rounded-lg flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">AI Content Generation</h4>
              <p className="text-xs text-muted-foreground">
                {content
                  ? "Regenerate your portfolio copy and structure using your onboarding data."
                  : "Generate portfolio content from your onboarding data using AI."
                }
              </p>
            </div>
            <Button className="shrink-0" onClick={handleRegenerate} disabled={isRegenerating}>
              {isRegenerating ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="size-4 mr-2" />
              )}
              {isRegenerating ? "Generating..." : content ? "Regenerate" : "Generate Content"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Preview */}
      {content && (
        <Card>
          <CardHeader>
            <CardTitle>Content Preview</CardTitle>
            <CardDescription>AI-generated content currently powering your portfolio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hero */}
            {content.hero && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Globe className="size-4" />
                  Hero Section
                </div>
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p className="font-semibold text-lg">{content.hero.headline}</p>
                  <p className="text-sm text-muted-foreground">{content.hero.subheadline}</p>
                </div>
              </div>
            )}

            {/* About */}
            {content.about?.paragraph && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="size-4" />
                  About
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm leading-relaxed">{content.about.paragraph}</p>
                </div>
              </div>
            )}

            {/* Services */}
            {content.services && content.services.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Briefcase className="size-4" />
                  Services ({content.services.length})
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {content.services.map((s, i) => (
                    <div key={i} className="bg-muted p-3 rounded-lg space-y-1">
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {content.projects && content.projects.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Megaphone className="size-4" />
                  Projects ({content.projects.length})
                </div>
                <div className="space-y-3">
                  {content.projects.map((p, i) => (
                    <div key={i} className="bg-muted p-3 rounded-lg space-y-1">
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                      <Separator className="my-1.5" />
                      <p className="text-xs text-primary">Result: {p.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {content.cta && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Sparkles className="size-4" />
                  Call to Action
                </div>
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p className="font-semibold">{content.cta.headline}</p>
                  <p className="text-sm text-muted-foreground">{content.cta.subtext}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No content yet */}
      {!content && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Sparkles className="size-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-1">No Content Generated Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click "Generate Content" above to create your portfolio using AI based on your onboarding data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
