"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink, Sparkles, Loader2, Globe, FileText, Briefcase, Megaphone, Pencil, Save, X, Plus, Trash2, Share2 } from "lucide-react";
import Link from "next/link";
import { usePortfolioActions } from "@/app/(dashboard)/dashboard/portfolio/_hooks/use-portfolio-actions";
import { useState, useEffect } from "react";
import type { PortfolioContent } from "@/app/(dashboard)/dashboard/actions";
import type { SocialLink, SocialPlatform } from "@/lib/validation/portfolio-schema";

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

  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<PortfolioContent | null>(content);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleSave = async () => {
    if (!editedContent) return;
    setIsSaving(true);
    try {
      const { updatePortfolioContent } = await import("@/app/(dashboard)/dashboard/actions");
      await updatePortfolioContent(editedContent);
      setEditMode(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(content);
    setEditMode(false);
  };

  const updateHero = (field: string, value: string) => {
    if (!editedContent) return;
    setEditedContent({
      ...editedContent,
      hero: { ...editedContent.hero, [field]: value }
    });
  };

  const updateAbout = (value: string) => {
    if (!editedContent) return;
    setEditedContent({
      ...editedContent,
      about: { paragraph: value }
    });
  };

  const updateCta = (field: string, value: string) => {
    if (!editedContent) return;
    setEditedContent({
      ...editedContent,
      cta: { ...editedContent.cta, [field]: value }
    });
  };

  const updateService = (index: number, field: string, value: string) => {
    if (!editedContent?.services) return;
    const newServices = [...editedContent.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setEditedContent({ ...editedContent, services: newServices });
  };

  const addService = () => {
    if (!editedContent) return;
    setEditedContent({
      ...editedContent,
      services: [...(editedContent.services || []), { title: "New Service", description: "Service description" }]
    });
  };

  const removeService = (index: number) => {
    if (!editedContent?.services) return;
    const newServices = editedContent.services.filter((_, i) => i !== index);
    setEditedContent({ ...editedContent, services: newServices });
  };

  const updateProject = (index: number, field: string, value: string) => {
    if (!editedContent?.projects) return;
    const newProjects = [...editedContent.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setEditedContent({ ...editedContent, projects: newProjects });
  };

  const addProject = () => {
    if (!editedContent) return;
    setEditedContent({
      ...editedContent,
      projects: [...(editedContent.projects || []), { title: "New Project", description: "Project description", result: "Project result" }]
    });
  };

  const removeProject = (index: number) => {
    if (!editedContent?.projects) return;
    const newProjects = editedContent.projects.filter((_, i) => i !== index);
    setEditedContent({ ...editedContent, projects: newProjects });
  };

  const updateSocialLink = (platform: SocialPlatform, field: "enabled" | "url", value: boolean | string) => {
    if (!editedContent) return;
    
    const currentLinks = editedContent.socialLinks || [];
    const existingIndex = currentLinks.findIndex((l) => l.platform === platform);
    
    let newLinks: SocialLink[];
    if (existingIndex >= 0) {
      newLinks = [...currentLinks];
      newLinks[existingIndex] = { 
        ...newLinks[existingIndex], 
        [field]: value,
        platform // ensure platform type is correct
      };
    } else {
      newLinks = [...currentLinks, { 
        platform, 
        enabled: field === "enabled" ? (value as boolean) : false, 
        url: field === "url" ? (value as string) : "" 
      }];
    }
    
    const newContent = { ...editedContent, socialLinks: newLinks };
    setEditedContent(newContent);
  };

  const getSocialLink = (platform: SocialPlatform): SocialLink | undefined => {
    return displayContent?.socialLinks?.find((l) => l.platform === platform);
  };

  const availablePlatforms: { platform: SocialPlatform; label: string }[] = [
    { platform: "twitter", label: "Twitter/X" },
    { platform: "linkedin", label: "LinkedIn" },
    { platform: "github", label: "GitHub" },
    { platform: "instagram", label: "Instagram" },
    { platform: "youtube", label: "YouTube" },
    { platform: "facebook", label: "Facebook" },
    { platform: "website", label: "Website" },
  ];

  const portfolioLink = `/${portfolio.handle}`;

  const displayContent = editMode ? editedContent : content;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio Management</h1>
          <p className="text-muted-foreground">
            Control your public profile, content, and visibility.
          </p>
        </div>
        {content && !editMode && (
          <Button variant="outline" onClick={() => setEditMode(true)}>
            <Pencil className="size-4 mr-2" />
            Edit Content
          </Button>
        )}
        {editMode && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="size-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Visibility */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Visibility</CardTitle>
                <CardDescription>Control whether your portfolio is publicly accessible.</CardDescription>
              </div>
              {isPublished ? (
                <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between py-2">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium leading-none">Publish Portfolio</span>
              <span className="text-sm text-muted-foreground">
                {content ? "Make your profile visible" : "Generate content first"}
              </span>
            </div>
            <Switch
              checked={isPublished}
              onCheckedChange={handlePublishChange}
              disabled={isPending}
            />
          </CardContent>
          <CardFooter className="bg-muted/50 border-t py-3 justify-between">
            <p className="text-sm text-muted-foreground">
              {new Date(portfolio.updatedAt).toLocaleDateString()}
            </p>
            {isPublished && (
              <Button variant="outline" size="sm" asChild>
                <Link href={portfolioLink} target="_blank">
                  <ExternalLink className="size-3.5 mr-1.5" />
                  View
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Design */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Design & Template</CardTitle>
            <CardDescription>Choose your portfolio layout style.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Template</Label>
              <Select defaultValue={portfolio.template} onValueChange={handleTemplateChange} disabled={isPending}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landing">Landing</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="veil">Veil (Minimal)</SelectItem>
                  <SelectItem value="bold">Bold (Dark)</SelectItem>
                  <SelectItem value="editorial">Editorial</SelectItem>
                  <SelectItem value="gallery">Gallery</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted p-3 rounded-lg flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium">AI Content</h4>
                <p className="text-xs text-muted-foreground">
                  {content ? "Regenerate copy" : "Generate with AI"}
                </p>
              </div>
              <Button size="sm" onClick={handleRegenerate} disabled={isRegenerating} className="shrink-0">
                {isRegenerating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Editor */}
      {displayContent && (
        <Card>
          <CardHeader>
            <CardTitle>Content {editMode ? "Editor" : "Preview"}</CardTitle>
            <CardDescription>
              {editMode ? "Edit your portfolio content below." : "AI-generated content powering your portfolio."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={["hero", "socials"]} className="w-full">
              {/* Hero */}
              <AccordionItem value="hero">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Globe className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Hero Section</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {editMode ? (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Headline</Label>
                        <Input
                          value={displayContent.hero?.headline || ""}
                          onChange={(e) => updateHero("headline", e.target.value)}
                          placeholder="Your headline"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Subheadline</Label>
                        <Textarea
                          value={displayContent.hero?.subheadline || ""}
                          onChange={(e) => updateHero("subheadline", e.target.value)}
                          placeholder="Your subheadline"
                          rows={2}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted p-4 rounded-lg space-y-1 pt-2">
                      <p className="font-semibold text-lg">{displayContent.hero?.headline}</p>
                      <p className="text-sm text-muted-foreground">{displayContent.hero?.subheadline}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* About */}
              <AccordionItem value="about">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">About Section</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {editMode ? (
                    <Textarea
                      value={displayContent.about?.paragraph || ""}
                      onChange={(e) => updateAbout(e.target.value)}
                      placeholder="Tell visitors about yourself..."
                      rows={6}
                      className="pt-2"
                    />
                  ) : (
                    <div className="bg-muted p-4 rounded-lg pt-2">
                      <p className="text-sm leading-relaxed">{displayContent.about?.paragraph}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Services */}
              <AccordionItem value="services">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Services ({displayContent.services?.length || 0})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 space-y-3">
                    {editMode && (
                      <div className="flex justify-end">
                        <Button size="sm" variant="outline" onClick={addService}>
                          <Plus className="size-3.5 mr-1" />
                          Add Service
                        </Button>
                      </div>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {displayContent.services?.map((s, i) => (
                        <div key={i} className={`bg-muted p-3 rounded-lg ${editMode ? "space-y-2" : "space-y-1"}`}>
                          {editMode ? (
                            <>
                              <Input
                                value={s.title}
                                onChange={(e) => updateService(i, "title", e.target.value)}
                                placeholder="Service title"
                                className="font-medium"
                              />
                              <Textarea
                                value={s.description}
                                onChange={(e) => updateService(i, "description", e.target.value)}
                                placeholder="Service description"
                                rows={2}
                              />
                              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full" onClick={() => removeService(i)}>
                                <Trash2 className="size-3.5 mr-1" />
                                Remove
                              </Button>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium">{s.title}</p>
                              <p className="text-xs text-muted-foreground">{s.description}</p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Projects */}
              <AccordionItem value="projects">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Megaphone className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Projects ({displayContent.projects?.length || 0})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 space-y-3">
                    {editMode && (
                      <div className="flex justify-end">
                        <Button size="sm" variant="outline" onClick={addProject}>
                          <Plus className="size-3.5 mr-1" />
                          Add Project
                        </Button>
                      </div>
                    )}
                    <div className="space-y-3">
                      {displayContent.projects?.map((p, i) => (
                        <div key={i} className={`bg-muted p-3 rounded-lg ${editMode ? "space-y-2" : "space-y-1"}`}>
                          {editMode ? (
                            <>
                              <Input
                                value={p.title}
                                onChange={(e) => updateProject(i, "title", e.target.value)}
                                placeholder="Project title"
                                className="font-medium"
                              />
                              <Textarea
                                value={p.description}
                                onChange={(e) => updateProject(i, "description", e.target.value)}
                                placeholder="Project description"
                                rows={2}
                              />
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Result</Label>
                                <Input
                                  value={p.result}
                                  onChange={(e) => updateProject(i, "result", e.target.value)}
                                  placeholder="Project result"
                                />
                              </div>
                              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full" onClick={() => removeProject(i)}>
                                <Trash2 className="size-3.5 mr-1" />
                                Remove
                              </Button>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium">{p.title}</p>
                              <p className="text-xs text-muted-foreground">{p.description}</p>
                              <Separator className="my-1.5" />
                              <p className="text-xs text-primary">Result: {p.result}</p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* CTA */}
              <AccordionItem value="cta">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Call to Action</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {editMode ? (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Headline</Label>
                        <Input
                          value={displayContent.cta?.headline || ""}
                          onChange={(e) => updateCta("headline", e.target.value)}
                          placeholder="CTA headline"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Subtext</Label>
                        <Textarea
                          value={displayContent.cta?.subtext || ""}
                          onChange={(e) => updateCta("subtext", e.target.value)}
                          placeholder="CTA subtext"
                          rows={2}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted p-4 rounded-lg space-y-1 pt-2">
                      <p className="font-semibold">{displayContent.cta?.headline}</p>
                      <p className="text-sm text-muted-foreground">{displayContent.cta?.subtext}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Social Links */}
              <AccordionItem value="socials">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Share2 className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Social Links</span>
                    {!editMode && <span className="text-xs text-muted-foreground ml-2">(Edit mode only)</span>}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 space-y-4">
                    {availablePlatforms.map(({ platform, label }) => {
                      const socialLink = getSocialLink(platform);
                      const isEnabled = socialLink?.enabled || false;
                      const url = socialLink?.url || "";

                      return (
                        <div key={platform} className="bg-muted p-3 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">{label}</Label>
                            <Switch
                              checked={editMode ? isEnabled : (socialLink?.enabled || false)}
                              onCheckedChange={(checked) => {
                                if (editMode) {
                                  updateSocialLink(platform, "enabled", checked);
                                }
                              }}
                              disabled={!editMode}
                            />
                          </div>
                          {editMode && isEnabled && (
                            <Input
                              value={url}
                              onChange={(e) => updateSocialLink(platform, "url", e.target.value)}
                              placeholder={`https://${platform}.com/yourprofile`}
                            />
                          )}
                          {!editMode && socialLink?.enabled && (
                            <p className="text-xs text-muted-foreground truncate">{socialLink.url}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
              Click the AI button above to generate your portfolio content.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
