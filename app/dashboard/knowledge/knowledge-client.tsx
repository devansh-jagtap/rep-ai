"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, fetchJson } from "@/lib/http/fetch-json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, File, Loader2, AlertCircle } from "lucide-react";
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
  const [inputMode, setInputMode] = useState<"text" | "file">("text");
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
      setUploadedFile(null);
      setInputMode("text");
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

  const sources = data?.sources ?? [];
  const status = error instanceof ApiError ? error.status : null;
  const message = error instanceof Error ? error.message : null;

  const getStatusBadge = (sourceStatus: string) => {
    switch (sourceStatus) {
      case "processing":
        return (
          <span className="flex items-center gap-1 text-xs text-blue-500">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
        );
      case "pending":
        return <span className="text-xs text-yellow-500">Pending</span>;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {isError && (
        <Card>
          <CardHeader>
            <CardTitle>{status === 401 ? "Sign in required" : "Unable to load knowledge base"}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              {status === 401 ? "Your session expired. Please sign in again." : message ?? "Request failed."}
            </p>
            {status === 401 ? (
              <Button asChild variant="outline" className="w-fit">
                <Link href="/auth/signin">Sign in</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add Knowledge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={inputMode === "file" ? "Title (auto-generated if empty)" : "Source title"}
          />

          <div className="flex gap-2 border-b">
            <button
              onClick={() => setInputMode("text")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                inputMode === "text"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Text
            </button>
            <button
              onClick={() => setInputMode("file")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                inputMode === "file"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Upload PDF
            </button>
          </div>

          {inputMode === "text" ? (
            <div className="space-y-3">
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Add text content for your AI agent"
                className="min-h-[160px]"
                maxLength={MAX_CONTENT_CHARS}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{content.length}/{MAX_CONTENT_CHARS} characters</span>
                <Button
                  onClick={handleAddText}
                  disabled={addMutation.isPending || !title.trim() || !content.trim()}
                >
                  {addMutation.isPending ? "Adding..." : "Add Text"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <FileUpload
                onUploadComplete={(result) => {
                  setUploadedFile(result);
                }}
                disabled={addMutation.isPending}
              />
              {uploadedFile && (
                <div className="space-y-2">
                  <UploadedFilePreview
                    fileName={uploadedFile.fileName}
                    fileSize={uploadedFile.fileSize}
                    status="ready"
                    onRemove={() => setUploadedFile(null)}
                  />
                  <Button
                    onClick={handleAddFile}
                    disabled={addMutation.isPending}
                    className="w-full"
                  >
                    {addMutation.isPending ? "Processing..." : "Add PDF"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Title will be auto-generated using AI
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[420px] pr-4">
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
                ))
              ) : sources.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No knowledge sources yet</p>
              ) : (
                sources.map((source) => (
                  <Card key={source.id}>
                    <CardContent className="flex items-start justify-between gap-4 p-4">
                      <div className="flex items-start gap-3">
                        {source.type === "pdf" ? (
                          <FileText className="h-5 w-5 text-primary mt-0.5" />
                        ) : (
                          <File className="h-5 w-5 text-muted-foreground mt-0.5" />
                        )}
                        <div>
                          <h3 className="font-medium">{source.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {source.type === "pdf" ? (
                              <>
                                <span>PDF</span>
                                {source.fileSize && <span>({formatFileSize(source.fileSize)})</span>}
                              </>
                            ) : (
                              <span>Text</span>
                            )}
                            <span>•</span>
                            <span>Chunks: {source.chunkCount}</span>
                            {source.status !== "complete" && (
                              <>
                                <span>•</span>
                                {getStatusBadge(source.status)}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {source.type === "text" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" onClick={() => setEditing(source)}>
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit knowledge</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-3">
                                <Input
                                  value={editing?.id === source.id ? editing.title : source.title}
                                  onChange={(event) =>
                                    setEditing((prev) =>
                                      prev ? { ...prev, title: event.target.value } : prev
                                    )
                                  }
                                />
                                <Textarea
                                  className="min-h-[220px]"
                                  value={editing?.id === source.id ? editing.content : source.content}
                                  onChange={(event) =>
                                    setEditing((prev) =>
                                      prev ? { ...prev, content: event.target.value } : prev
                                    )
                                  }
                                />
                                <Button
                                  onClick={() =>
                                    editing && editMutation.mutate({ id: editing.id, title: editing.title, content: editing.content })
                                  }
                                  disabled={editMutation.isPending}
                                >
                                  {editMutation.isPending ? "Saving..." : "Save"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Button
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(source.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? "..." : "Delete"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
