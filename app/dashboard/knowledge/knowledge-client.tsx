"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface KnowledgeSource {
  id: string;
  title: string;
  content: string;
  chunkCount: number;
}

const MAX_CONTENT_CHARS = 20_000;

function fetchKnowledge(): Promise<{ sources: KnowledgeSource[] }> {
  return fetch("/api/knowledge").then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });
}

export function KnowledgeClient() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState<KnowledgeSource | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["knowledge"],
    queryFn: fetchKnowledge,
  });

  const addMutation = useMutation({
    mutationFn: async (body: { title: string; content: string }) => {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to add");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
      setTitle("");
      setContent("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      const res = await fetch(`/api/knowledge/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("Failed to update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
      setEditing(null);
    },
  });

  const sources = data?.sources ?? [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Source title" />
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Add knowledge for your AI agent"
            className="min-h-[160px]"
            maxLength={MAX_CONTENT_CHARS}
          />
          <div className="text-xs text-muted-foreground">{content.length}/{MAX_CONTENT_CHARS} characters</div>
          <Button 
            onClick={() => addMutation.mutate({ title, content })} 
            disabled={addMutation.isPending || !title.trim() || !content.trim()}
          >
            {addMutation.isPending ? "Adding..." : "Add Knowledge"}
          </Button>
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
                      <div>
                        <h3 className="font-medium">{source.title}</h3>
                        <p className="text-sm text-muted-foreground">Chunks: {source.chunkCount}</p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setEditing(source)}>Edit</Button>
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
                                onClick={() => editing && editMutation.mutate({ id: editing.id, title: editing.title, content: editing.content })}
                                disabled={editMutation.isPending}
                              >
                                {editMutation.isPending ? "Saving..." : "Save"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
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
