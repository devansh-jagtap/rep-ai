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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Sparkles, Loader2, Globe, FileText, Briefcase, Megaphone, Pencil, Save, X, Plus, Trash2, Share2, RefreshCw, Layout, Eye, Settings2 } from "lucide-react";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { ServicesSection } from "./components/ServicesSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { ProductsSection } from "./components/ProductsSection";
import { HistorySection } from "./components/HistorySection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { FAQSection } from "./components/FAQSection";
import { GallerySection } from "./components/GallerySection";
import { CTASection } from "./components/CTASection";
import { SocialLinksSection } from "./components/SocialLinksSection";
import Link from "next/link";
import { usePortfolioActions } from "./_hooks/use-portfolio-actions";
import { usePortfolioEditorStore } from "./_hooks/use-portfolio-editor-store";
import { useEffect, useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import type { PortfolioContent } from "../actions";
import type { SocialLink, SocialPlatform } from "@/lib/validation/portfolio-schema";
import {
  isSectionVisible,
  mergeVisibleSections,
  PORTFOLIO_SECTION_REGISTRY,
  type PortfolioSectionKey,
} from "@/lib/portfolio/section-registry";

interface PortfolioClientProps {
  portfolio: {
    handle: string;
    subdomain?: string | null;
    isPublished: boolean;
    template: string;
    updatedAt: string;
  };
  plan?: string;
  content: PortfolioContent | null;
}

const getVisibleSections = (content: PortfolioContent | null | undefined) => ({
  ...mergeVisibleSections(content?.visibleSections),
});

export function PortfolioClient({ portfolio, plan = "free", content }: PortfolioClientProps) {
  const {
    isPending,
    isPublished,
    isRegenerating,
    handlePublishChange,
    handleTemplateChange,
    handleRegenerate,
  } = usePortfolioActions(Boolean(content), portfolio.isPublished);

  const { editedContent, setEditedContent, resetFromServer } = usePortfolioEditorStore();
  const [syncUrl, setSyncUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("hero");

  const saveMutation = useMutation({
    mutationFn: async (nextContent: PortfolioContent) => {
      const { updatePortfolioContent } = await import("@/app/dashboard/actions");
      await updatePortfolioContent(nextContent);
    },
  });

  useEffect(() => {
    resetFromServer(content);
  }, [content, resetFromServer]);

  const handleSave = async () => {
    if (!editedContent) return;
    try {
      await saveMutation.mutateAsync(editedContent);
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const handleCancel = () => {
    setEditedContent(content ? { ...content, visibleSections: mergeVisibleSections(content.visibleSections) } : content);
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

  const updateProduct = (index: number, field: string, value: string) => {
    if (!editedContent?.products) return;
    const newProducts = [...editedContent.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setEditedContent({ ...editedContent, products: newProducts });
  };

  const addProduct = () => {
    if (!editedContent) return;
    setEditedContent({
      ...editedContent,
      products: [...(editedContent.products || []), { title: "New Product", description: "Description", price: "$0.00", url: "", image: "" }]
    });
  };

  const removeProduct = (index: number) => {
    if (!editedContent?.products) return;
    const newProducts = editedContent.products.filter((_: any, i: number) => i !== index);
    setEditedContent({ ...editedContent, products: newProducts });
  };

  const updateHistory = (index: number, field: string, value: string) => {
    if (!editedContent?.history) return;
    const newHistory = [...editedContent.history];
    newHistory[index] = { ...newHistory[index], [field]: value };
    setEditedContent({ ...editedContent, history: newHistory });
  };

  const addHistory = () => {
    if (!editedContent) return;
    setEditedContent({
      ...editedContent,
      history: [...(editedContent.history || []), { role: "Role", company: "Company", period: "2020-2024", description: "Description" }]
    });
  };

  const removeHistory = (index: number) => {
    if (!editedContent?.history) return;
    const newHistory = editedContent.history.filter((_: any, i: number) => i !== index);
    setEditedContent({ ...editedContent, history: newHistory });
  };

  const updateTestimonial = (index: number, field: string, value: string) => {
    if (!editedContent?.testimonials) return;
    const newTestimonials = [...editedContent.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setEditedContent({ ...editedContent, testimonials: newTestimonials });
  };

  const addTestimonial = () => {
    if (!editedContent) return;
    setEditedContent({
      ...editedContent,
      testimonials: [...(editedContent.testimonials || []), { quote: "Great work!", author: "John Doe", role: "CEO" }]
    });
  };

  const removeTestimonial = (index: number) => {
    if (!editedContent?.testimonials) return;
    const newTestimonials = editedContent.testimonials.filter((_: any, i: number) => i !== index);
    setEditedContent({ ...editedContent, testimonials: newTestimonials });
  };

  const updateFaq = (index: number, field: string, value: string) => {
    if (!editedContent?.faq) return;
    const newFaq = [...editedContent.faq];
    newFaq[index] = { ...newFaq[index], [field]: value };
    setEditedContent({ ...editedContent, faq: newFaq });
  };

  const addFaq = () => {
    if (!editedContent) return;
    setEditedContent({
      ...editedContent,
      faq: [...(editedContent.faq || []), { question: "Question?", answer: "Answer" }]
    });
  };

  const removeFaq = (index: number) => {
    if (!editedContent?.faq) return;
    const newFaq = editedContent.faq.filter((_: any, i: number) => i !== index);
    setEditedContent({ ...editedContent, faq: newFaq });
  };

  const updateGallery = (index: number, field: string, value: string) => {
    if (!editedContent?.gallery) return;
    const newGallery = [...editedContent.gallery];
    newGallery[index] = { ...newGallery[index], [field]: value };
    setEditedContent({ ...editedContent, gallery: newGallery });
  };

  const addGalleryImage = () => {
    if (!editedContent) return;
    setEditedContent({
      ...editedContent,
      gallery: [...(editedContent.gallery || []), { url: "https://example.com/image.jpg", caption: "Caption" }]
    });
  };

  const removeGalleryImage = (index: number) => {
    if (!editedContent?.gallery) return;
    const newGallery = editedContent.gallery.filter((_: any, i: number) => i !== index);
    setEditedContent({ ...editedContent, gallery: newGallery });
  };

  const updateVisibleSection = (section: PortfolioSectionKey, visible: boolean) => {
    if (!editedContent) return;
    const current = mergeVisibleSections(editedContent.visibleSections);
    const next = visible ? [...new Set([...current, section])] : current.filter((key) => key !== section);
    setEditedContent({
      ...editedContent,
      visibleSections: mergeVisibleSections(next),
    });
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

  const handleSyncFromWebsite = async () => {
    if (!syncUrl.trim()) return;
    setIsSyncing(true);
    try {
      // 1. Scrape
      const scrapeResp = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: syncUrl }),
      });
      const scrapeData = await scrapeResp.json();
      if (!scrapeData.success) throw new Error(scrapeData.error || "Scrape failed");

      // 2. Extract
      const extractResp = await fetch("/api/ai/extract-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: scrapeData.text }),
      });
      const extractData = await extractResp.json();
      if (!extractData.success) throw new Error(extractData.error || "Extraction failed");

      // 3. Apply to editedContent
      if (editedContent) {
        setEditedContent({
          ...editedContent,
          ...extractData.data,
          hero: { ...editedContent.hero, ...extractData.data.hero },
          about: { ...editedContent.about, ...extractData.data.about },
        });
        setShowSyncDialog(false);
        setSyncUrl("");
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
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

  const appOrigin = useMemo(() => {
    const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (configuredOrigin) return configuredOrigin.replace(/\/$/, "");
    if (typeof window !== "undefined") return window.location.origin;
    return "";
  }, []);

  const hasProPlan = plan === "pro" || plan === "business" || plan === "agency";

  const portfolioLink = useMemo(() => {
    if (hasProPlan && portfolio.subdomain && appOrigin) {
      try {
        const originUrl = new URL(appOrigin);
        const host = originUrl.host.replace(/^www\./, "");
        return `${originUrl.protocol}//${portfolio.subdomain}.${host}`;
      } catch (e) {
        return `/${portfolio.handle}`;
      }
    }
    return `/${portfolio.handle}`;
  }, [hasProPlan, portfolio.subdomain, portfolio.handle, appOrigin]);

  const displayUrl = useMemo(() => {
    if (hasProPlan && portfolio.subdomain && appOrigin) {
      try {
        const originUrl = new URL(appOrigin);
        const host = originUrl.host.replace(/^www\./, "");
        return `${portfolio.subdomain}.${host}`;
      } catch (e) {
        return `/${portfolio.handle}`;
      }
    }
    return `/${portfolio.handle}`;
  }, [hasProPlan, portfolio.subdomain, portfolio.handle, appOrigin]);

  const displayContent = editedContent || content;
  const hasChanges = JSON.stringify(content) !== JSON.stringify(editedContent) && !!editedContent;
  const visibleSections = mergeVisibleSections(displayContent?.visibleSections);
  const visibleSectionCount = PORTFOLIO_SECTION_REGISTRY.filter((section) =>
    isSectionVisible(visibleSections, section.key)
  ).length;

  const isContentSectionVisible = (section: PortfolioSectionKey) =>
    isSectionVisible(visibleSections, section);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-8">
      <Card className="border-1">
        <CardHeader className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="mt-2 text-3xl tracking-tight">Portfolio Command Center</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Redesign, edit, and publish your public portfolio from one place.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isPublished ? (
                <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
              <Badge variant="outline">{visibleSectionCount} sections active</Badge>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">Public URL</p>
              <p className="mt-1 truncate font-medium">{displayUrl}</p>
            </div>
            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">Template</p>
              <p className="mt-1 capitalize font-medium">{portfolio.template}</p>
            </div>
            <div className="rounded-xl border bg-background/70 p-4">
              <p className="text-xs text-muted-foreground">Last updated</p>
              <p className="mt-1 font-medium">{new Date(portfolio.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Floating Action Bar */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4 w-full max-w-2xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-background/80 backdrop-blur-xl border border-primary/20 rounded-full p-2 flex items-center justify-between gap-4 ring-1 ring-black/5">
            <div className="flex items-center gap-2 pl-4">
              <div className="size-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider">Unsaved Changes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saveMutation.isPending} className="rounded-full h-9">
                <X className="size-4 mr-2" />
                Discard
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="rounded-full h-9 px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                {saveMutation.isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 group">
            <Switch
              id="publish-toggle"
              checked={isPublished}
              onCheckedChange={handlePublishChange}
              disabled={isPending}
              className="data-[state=checked]:bg-green-500"
            />
            <Label htmlFor="publish-toggle" className="cursor-pointer text-sm font-semibold text-muted-foreground group-data-[state=checked]:text-foreground transition-colors">
              Publicly Live
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {content && (
            <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <RefreshCw className="size-4" />
                  <span className="hidden sm:inline">Sync content</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Sync from Website</DialogTitle>
                  <DialogDescription>
                    Enter a URL to extract your details (Bio, Services, etc.) using AI.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      placeholder="https://your-old-site.com"
                      value={syncUrl}
                      onChange={(e) => setSyncUrl(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSyncDialog(false)}>Cancel</Button>
                  <Button onClick={handleSyncFromWebsite} disabled={isSyncing || !syncUrl.trim()}>
                    {isSyncing ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Sparkles className="size-4 mr-2" />}
                    Start Sync
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Select defaultValue={portfolio.template} onValueChange={handleTemplateChange} disabled={isPending}>
            <SelectTrigger className="w-[140px] h-9 font-medium">
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="landing">Landing</SelectItem>
              <SelectItem value="modern">Modern</SelectItem>
              <SelectItem value="veil">Veil</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
              <SelectItem value="editorial">Editorial</SelectItem>
              <SelectItem value="gallery">Gallery</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="interactive">Interactive</SelectItem>
            </SelectContent>
          </Select>

          {isPublished && (
            <Button variant="outline" size="sm" asChild className="h-9 gap-2">
              <Link href={portfolioLink} target="_blank">
                <Eye className="size-4" />
                <span className="hidden sm:inline">Preview Live</span>
              </Link>
            </Button>
          )}

          <Button size="icon" variant="ghost" onClick={handleRegenerate} disabled={isRegenerating} className="h-9 w-9 text-primary hover:text-primary hover:bg-primary/10">
            {isRegenerating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          </Button>
        </div>
      </div>

      {
        displayContent && (
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex flex-col lg:flex-row gap-8 items-start">
            <Card className="w-full lg:w-72 shrink-0 overflow-hidden border-primary/10 shadow-xl shadow-primary/5 bg-background/50 backdrop-blur-md sticky top-6">
              <div className="p-5 bg-primary/5 border-b">
                <h3 className="text-sm tracking-tight">Command Center</h3>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Navigation & Control</p>
              </div>
              <TabsList className="flex flex-col h-auto bg-transparent p-3 gap-1.5 w-full justify-start items-stretch">
                {[
                  { key: "hero", label: "Hero Section" },
                  { key: "about", label: "About Me" },
                  { key: "services", label: "My Services" },
                  { key: "projects", label: "Projects" },
                  { key: "products", label: "Products" },
                  { key: "history", label: "Work History" },
                  { key: "testimonials", label: "Testimonials" },
                  { key: "faq", label: "FAQ / Support" },
                  { key: "gallery", label: "Media Gallery" },
                  { key: "cta", label: "Call to Action" },
                  { key: "socials", label: "Social Links" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center group">
                    <TabsTrigger
                      value={item.key}
                      className="flex-1 justify-start gap-3 px-4 py-2.5 text-sm font-normal data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 rounded-xl"
                    >
                      <span>{item.label}</span>
                    </TabsTrigger>
                  </div>
                ))}
              </TabsList>
              <div className="p-5 bg-muted/30 border-t space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Health Score</span>
                  <span className="text-primary">{Math.round((visibleSectionCount / 11) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-primary transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                    style={{ width: `${(visibleSectionCount / 11) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Aim for 80%+ visibility for the best visitor engagement.
                </p>
              </div>
            </Card>

            <div className="flex-1 min-w-0 w-full animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="border-primary/10 shadow-2xl shadow-primary/5 min-h-[600px] flex flex-col bg-background/40 backdrop-blur-sm overflow-hidden border-2 border-primary/5">
                <CardHeader className="py-6 px-8 border-b bg-muted/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-normal tracking-tight capitalize">{activeTab}</h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-full border">
                        <Label htmlFor={`${activeTab}-visibility`} className="text-xs font-normal cursor-pointer">Visible</Label>
                        <Switch
                          id={`${activeTab}-visibility`}
                          checked={activeTab === 'socials' ? true : isContentSectionVisible(activeTab as PortfolioSectionKey)}
                          disabled={activeTab === 'socials'}
                          onCheckedChange={(checked) => updateVisibleSection(activeTab as PortfolioSectionKey, checked)}
                          className="scale-75 data-[state=checked]:bg-primary"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 flex-1">
                  <TabsContent value="hero" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <HeroSection
                      editMode={true}
                      content={displayContent?.hero || null}
                      onUpdate={updateHero}
                      isVisible={isContentSectionVisible("hero")}
                      onVisibilityChange={(checked) => updateVisibleSection("hero", checked)}
                    />
                  </TabsContent>
                  <TabsContent value="about" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <AboutSection
                      editMode={true}
                      content={displayContent?.about || null}
                      onUpdate={updateAbout}
                      isVisible={isContentSectionVisible("about")}
                      onVisibilityChange={(checked) => updateVisibleSection("about", checked)}
                    />
                  </TabsContent>
                  <TabsContent value="services" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <ServicesSection
                      editMode={true}
                      content={displayContent?.services || null}
                      onUpdate={updateService}
                      onAdd={addService}
                      onRemove={removeService}
                      isVisible={isContentSectionVisible("services")}
                      onVisibilityChange={(checked) => updateVisibleSection("services", checked)}
                    />
                  </TabsContent>
                  <TabsContent value="projects" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <ProjectsSection
                      editMode={true}
                      content={displayContent?.projects || null}
                      onUpdate={updateProject}
                      onAdd={addProject}
                      onRemove={removeProject}
                      isVisible={isContentSectionVisible("projects")}
                      onVisibilityChange={(checked) => updateVisibleSection("projects", checked)}
                    />
                  </TabsContent>
                  <TabsContent value="products" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <ProductsSection
                      editMode={true}
                      content={displayContent?.products || null}
                      onUpdate={updateProduct}
                      onAdd={addProduct}
                      onRemove={removeProduct}
                      isVisible={isContentSectionVisible("products")}
                      onVisibilityChange={(checked) => updateVisibleSection("products", checked)}
                    />
                  </TabsContent>
                  <TabsContent value="history" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <HistorySection
                      editMode={true}
                      content={displayContent?.history || null}
                      onUpdate={updateHistory}
                      onAdd={addHistory}
                      onRemove={removeHistory}
                      isVisible={isContentSectionVisible("history")}
                      onVisibilityChange={(checked) => updateVisibleSection("history", checked)}
                    />
                  </TabsContent>
                  <TabsContent value="testimonials" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <TestimonialsSection
                      editMode={true}
                      content={displayContent?.testimonials || null}
                      onUpdate={updateTestimonial}
                      onAdd={addTestimonial}
                      onRemove={removeTestimonial}
                      isVisible={isContentSectionVisible("testimonials")}
                      onVisibilityChange={(checked) => updateVisibleSection("testimonials", checked)}
                    />
                  </TabsContent>
                  <TabsContent value="faq" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <FAQSection
                      editMode={true}
                      content={displayContent?.faq || null}
                      onUpdate={updateFaq}
                      onAdd={addFaq}
                      onRemove={removeFaq}
                      isVisible={isContentSectionVisible("faq")}
                      onVisibilityChange={(checked) => updateVisibleSection("faq", checked)}
                    />
                  </TabsContent>
                  <TabsContent value="gallery" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <GallerySection
                      editMode={true}
                      content={displayContent?.gallery || null}
                      onUpdate={updateGallery}
                      onAdd={addGalleryImage}
                      onRemove={removeGalleryImage}
                      isVisible={isContentSectionVisible("gallery")}
                      onVisibilityChange={(checked) => updateVisibleSection("gallery", checked)}
                    />
                  </TabsContent>
                  <TabsContent value="cta" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <CTASection
                      editMode={true}
                      content={displayContent?.cta || null}
                      onUpdate={updateCta}
                      isVisible={isContentSectionVisible("cta")}
                      onVisibilityChange={(checked) => updateVisibleSection("cta", checked)}
                    />
                  </TabsContent>
                  <TabsContent value="socials" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <SocialLinksSection
                      editMode={true}
                      availablePlatforms={availablePlatforms}
                      getSocialLink={getSocialLink}
                      onUpdate={updateSocialLink}
                      isVisible={true}
                    />
                  </TabsContent>
                </CardContent>
                {/* <div className="p-4 bg-muted/5 border-t text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
                    <Layout className="size-3" />
                    Portfolio AI Command Center &copy; 2024
                  </p>
                </div> */}
              </Card>
            </div>
          </Tabs>
        )
      }

      {/* No content yet */}
      {
        !content && (
          <Card className="border-dashed border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
            <CardContent className="py-20 text-center">
              <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5">
                <Sparkles className="size-10 text-primary animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">No Content Yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                Your portfolio is a blank canvas. Let our AI help you generate a professional presence in seconds.
              </p>
              <Button size="lg" onClick={handleRegenerate} disabled={isRegenerating} className="rounded-full px-8 shadow-xl shadow-primary/20">
                {isRegenerating ? <Loader2 className="size-5 mr-2 animate-spin" /> : <Sparkles className="size-5 mr-2" />}
                Generate My Portfolio
              </Button>
            </CardContent>
          </Card>
        )
      }
    </div >
  );
}
