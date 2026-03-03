"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, fetchJson } from "@/lib/http/fetch-json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  File,
  Loader2,
  AlertCircle,
  Plus,
  Search,
  Globe,
  Type,
  Trash2,
  Edit2,
  Database,
  ExternalLink,
  Layout,
  Info,
  Save
} from "lucide-react";
import { FileUpload, UploadedFilePreview } from "@/components/knowledge/file-upload";


interface KnowledgeSource {
  id: string;
  title: string;
  content: string;
  type: string;
  fileUrl: string | null;
  fileSize: number | null;
  mimeType: string | null;
  status: string;
  chunkCount: number;
}

const MAX_CONTENT_CHARS = 20_000;

function fetchKnowledge(): Promise<{ sources: KnowledgeSource[] }> {
  return fetchJson("/api/knowledge");
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function KnowledgeClient() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState<KnowledgeSource | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    fileUrl: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  } | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["knowledge"],
    queryFn: fetchKnowledge,
  });

  const sources = useMemo(() => data?.sources ?? [], [data]);
  const filteredSources = useMemo(() => {
    if (!searchQuery.trim()) return sources;
    const query = searchQuery.toLowerCase();
    return sources.filter(s =>
      s.title.toLowerCase().includes(query) ||
      (s.content && s.content.toLowerCase().includes(query))
    );
  }, [sources, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: sources.length,
      pdf: sources.filter(s => s.type === "pdf").length,
      text: sources.filter(s => s.type === "text").length,
      processing: sources.filter(s => s.status === "processing" || s.status === "pending").length,
    };
  }, [sources]);

  const addMutation = useMutation({
    mutationFn: async (body: { title: string; content?: string; fileUrl?: string; mimeType?: string; fileSize?: number; type?: string }) => {
      await fetchJson("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
      setTitle("");
      setContent("");
      setWebsiteUrl("");
      setUploadedFile(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetchJson(`/api/knowledge/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      await fetchJson(`/api/knowledge/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
      setEditing(null);
    },
  });

  const handleAddText = () => {
    if (!title.trim() || !content.trim()) return;
    addMutation.mutate({ title, content, type: "text" });
  };

  const handleAddFile = () => {
    if (!uploadedFile) return;
    const fileTitle = uploadedFile.fileName.replace(/\.pdf$/i, "");
    const finalTitle = title.trim() || fileTitle;
    addMutation.mutate({
      title: finalTitle,
      fileUrl: uploadedFile.fileUrl,
      mimeType: uploadedFile.mimeType,
      fileSize: uploadedFile.fileSize,
      type: "pdf",
    });
  };

  const handleScrapeWebsite = async () => {
    if (!websiteUrl.trim()) return;
    setIsScraping(true);
    try {
      const resp = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });
      const data = await resp.json();
      if (!data.success) throw new Error(data.error || "Scrape failed");

      const finalTitle = title.trim() || `Website: ${websiteUrl.replace(/^https?:\/\//, "")}`;
      addMutation.mutate({
        title: finalTitle,
        content: data.text,
        type: "text",
      });
    } catch (err) {
      console.error("Scrape error:", err);
    } finally {
      setIsScraping(false);
    }
  };

  const apiStatus = error instanceof ApiError ? error.status : null;
  const apiMessage = error instanceof Error ? error.message : null;

  const getStatusBadge = (sourceStatus: string) => {
    switch (sourceStatus) {
      case "processing":
        return (
          <Badge variant="secondary" className="flex items-center gap-1.5 px-2 py-0 h-5 bg-blue-500/10 text-blue-500 border-none font-medium text-[10px] uppercase tracking-wider">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="secondary" className="flex items-center gap-1.5 px-2 py-0 h-5 bg-red-500/10 text-red-500 border-none font-medium text-[10px] uppercase tracking-wider">
            <AlertCircle className="h-2.5 w-2.5" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="px-2 py-0 h-5 bg-yellow-500/10 text-yellow-500 border-none font-medium text-[10px] uppercase tracking-wider">
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-10">
      {isError && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2 font-normal">
              <AlertCircle className="h-5 w-5" />
              {apiStatus === 401 ? "Sign in required" : "Unable to load knowledge base"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground font-normal">
              {apiStatus === 401 ? "Your session expired. Please sign in again." : apiMessage ?? "Request failed."}
            </p>
            {apiStatus === 401 ? (
              <Button asChild variant="outline" className="w-fit rounded-full font-normal">
                <Link href="/auth/signin">Sign in</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Header Command Center Style */}
      <Card className="border-primary/5 bg-background/50 backdrop-blur-md">
        <CardHeader className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl tracking-tight font-normal">Knowledge Command Center</h1>
              <p className="text-sm text-muted-foreground max-w-2xl font-normal">
                Feed your AI agent with documentation, websites, and data to make it smarter and more helpful.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-7 px-3 rounded-full border-primary/20 bg-primary/5 font-normal">
                {stats.processing > 0 ? (
                  <span className="flex items-center gap-1.5 font-normal">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    {stats.processing} processing
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-normal">
                    <Database className="h-3 w-3 text-primary" />
                    System Active
                  </span>
                )}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-primary/5 bg-background/70 p-4 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Total Sources</p>
              <p className="mt-1 text-2xl font-normal tracking-tight">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-primary/5 bg-background/70 p-4 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">PDF Documents</p>
              <p className="mt-1 text-2xl font-normal tracking-tight">{stats.pdf}</p>
            </div>
            <div className="rounded-xl border border-primary/5 bg-background/70 p-4 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Text Snippets</p>
              <p className="mt-1 text-2xl font-normal tracking-tight">{stats.text}</p>
            </div>
            <div className="rounded-xl border border-primary/5 bg-background/70 p-4 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Status</p>
              <div className="mt-1 flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <p className="text-sm font-normal">Ready to serve</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Add Knowledge */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          <Card className="border-primary/5 shadow-xl shadow-primary/5 bg-background/60 backdrop-blur-sm border-2 overflow-hidden py-1">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Plus className="h-4 w-4" />
                </div>
                <CardTitle className="text-xl font-normal tracking-tight">Add Knowledge</CardTitle>
              </div>
              <CardDescription className="text-xs font-normal">Expand your agent's brain with new information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground ml-1">Title</p>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g., Company Policy, FAQ, Service Details"
                  className="bg-background/50 border-primary/10 focus-visible:ring-primary/20 rounded-xl font-normal"
                />
              </div>

              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted/40 p-1 rounded-xl mb-4 h-11">
                  <TabsTrigger value="text" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-normal text-xs gap-2">
                    <Type className="h-3.5 w-3.5" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="file" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-normal text-xs gap-2">
                    <FileText className="h-3.5 w-3.5" />
                    PDF
                  </TabsTrigger>
                  <TabsTrigger value="website" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-normal text-xs gap-2">
                    <Globe className="h-3.5 w-3.5" />
                    Web
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-2">
                    <Textarea
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      placeholder="Paste or type content here..."
                      className="h-[300px] bg-background/50 border-primary/10 rounded-xl text-sm font-normal leading-relaxed resize-none"
                      maxLength={MAX_CONTENT_CHARS}
                    />
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 flex-1 max-w-[150px]">
                        <Progress value={(content.length / MAX_CONTENT_CHARS) * 100} className="h-1 bg-muted" />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap font-normal">
                          {content.length.toLocaleString()}/{MAX_CONTENT_CHARS.toLocaleString()}
                        </span>
                      </div>
                      <Button
                        onClick={handleAddText}
                        disabled={addMutation.isPending || !title.trim() || !content.trim()}
                        className="rounded-full px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 h-9 text-xs font-normal"
                      >
                        {addMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Plus className="h-3.5 w-3.5 mr-2" />}
                        Save Material
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="file" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <FileUpload
                    onUploadComplete={(result) => setUploadedFile(result)}
                    disabled={addMutation.isPending}
                  />
                  {uploadedFile && (
                    <div className="space-y-3 p-1">
                      <UploadedFilePreview
                        fileName={uploadedFile.fileName}
                        fileSize={uploadedFile.fileSize}
                        status="ready"
                        onRemove={() => setUploadedFile(null)}
                      />
                      <Button
                        onClick={handleAddFile}
                        disabled={addMutation.isPending}
                        className="w-full rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 h-10 text-xs font-normal"
                      >
                        {addMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <FileText className="h-3.5 w-3.5 mr-2" />}
                        Process PDF
                      </Button>
                      <p className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground mt-2 font-normal">
                        <Info className="h-3 w-3" />
                        AI will analyze and chunk the document for better retrieval.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="website" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground ml-1 text-center">Enter Website URL</p>
                      <Input
                        value={websiteUrl}
                        onChange={(event) => setWebsiteUrl(event.target.value)}
                        placeholder="https://example.com/about"
                        className="bg-background/50 border-primary/10 rounded-xl font-normal"
                      />
                    </div>
                    <Button
                      onClick={handleScrapeWebsite}
                      disabled={isScraping || addMutation.isPending || !websiteUrl.trim()}
                      className="w-full rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 h-10 text-xs font-normal"
                    >
                      {isScraping || addMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Scraping Content...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5" />
                          Import from Web
                        </span>
                      )}
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed font-normal">
                      We'll extract the main text content and add it to your knowledge base.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Knowledge Sources List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Layout className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-normal tracking-tight">Managed Information</h2>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-primary/10 rounded-full h-9 text-xs focus-visible:ring-primary/20 font-normal"
              />
            </div>
          </div>

          <Card className="border-primary/5 shadow-2xl shadow-primary/5 bg-background/40 backdrop-blur-sm border-2 overflow-hidden">
            <CardContent className="p-0">
              <ScrollArea className="h-[700px]">
                {isLoading ? (
                  <div className="p-6 space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-primary/5 bg-background/50">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : filteredSources.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                    <div className="size-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-lg font-normal tracking-tight">No results found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[250px] font-normal">
                      {searchQuery ? `No sources matching "${searchQuery}"` : "Your knowledge base is currently empty. Add your first source on the left."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-primary/5">
                    {filteredSources.map((source) => (
                      <div key={source.id} className="group p-5 flex items-start justify-between gap-4 hover:bg-primary/[0.02] transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={`mt-0.5 p-2.5 rounded-xl border ${source.type === "pdf" ? "bg-red-500/5 border-red-500/10 text-red-500" : "bg-primary/5 border-primary/10 text-primary"
                            }`}>
                            {source.type === "pdf" ? <FileText className="h-5 w-5" /> : <Type className="h-5 w-5" />}
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-normal tracking-tight leading-none group-hover:text-primary transition-colors">
                              {source.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground font-normal">
                              <span className="flex items-center gap-1 capitalize font-normal">
                                {source.type} Source
                              </span>
                              {source.fileSize && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 font-normal">
                                  {formatFileSize(source.fileSize)}
                                </span>
                              )}
                              <span className="flex items-center gap-1 font-normal">
                                <Database className="h-3 w-3" />
                                {source.chunkCount} active chunks
                              </span>
                              {source.status !== "complete" && getStatusBadge(source.status)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {source.type === "text" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditing(source)}
                                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-xl rounded-2xl border-primary/10 bg-background/95 backdrop-blur-xl">
                                <DialogHeader>
                                  <DialogTitle className="font-normal tracking-tight">Edit Material</DialogTitle>
                                  <CardDescription className="font-normal">Update the title or content of this knowledge source.</CardDescription>
                                </DialogHeader>
                                <div className="space-y-5 py-4">
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground ml-1">Source Title</p>
                                    <Input
                                      value={editing?.id === source.id ? editing.title : source.title}
                                      onChange={(event) =>
                                        setEditing((prev) =>
                                          prev ? { ...prev, title: event.target.value } : prev
                                        )
                                      }
                                      className="rounded-xl border-primary/10 bg-muted/30 font-normal"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground ml-1">Content Body</p>
                                    <Textarea
                                      className="h-[400px] rounded-xl border-primary/10 bg-muted/30 text-sm leading-relaxed font-normal resize-none"
                                      value={editing?.id === source.id ? editing.content : source.content}
                                      onChange={(event) =>
                                        setEditing((prev) =>
                                          prev ? { ...prev, content: event.target.value } : prev
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditing(null)}
                                    className="rounded-full px-6 h-10 text-xs border-primary/10 font-normal"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      editing && editMutation.mutate({ id: editing.id, title: editing.title, content: editing.content })
                                    }
                                    disabled={editMutation.isPending}
                                    className="rounded-full px-8 h-10 text-xs shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 font-normal"
                                  >
                                    {editMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Save className="h-3.5 w-3.5 mr-2" />}
                                    Apply Changes
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                              if (confirm("Are you sure you want to remove this source?")) {
                                deleteMutation.mutate(source.id);
                              }
                            }}
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="p-4 bg-muted/5 border-t text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-normal flex items-center justify-center gap-2">
                  <ExternalLink className="size-3" />
                  Processed by Vector Intelligence Engine
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
