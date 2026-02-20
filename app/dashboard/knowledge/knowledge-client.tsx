"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

interface KnowledgeSource {
  id: string;
  title: string;
  content: string;
  chunkCount: number;
}

const MAX_CONTENT_CHARS = 20_000;

export function KnowledgeClient() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<KnowledgeSource | null>(null);

  const load = async () => {
    const response = await fetch("/api/knowledge");
    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { sources: KnowledgeSource[] };
    setSources(payload.sources);
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    setLoading(true);
    const response = await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    setLoading(false);
    if (!response.ok) {
      return;
    }

    setTitle("");
    setContent("");
    await load();
  };

  const remove = async (id: string) => {
    const response = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
    if (!response.ok) {
      return;
    }

    await load();
  };

  const saveEdit = async () => {
    if (!editing) {
      return;
    }

    const response = await fetch(`/api/knowledge/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editing.title, content: editing.content }),
    });

    if (!response.ok) {
      return;
    }

    setEditing(null);
    await load();
  };

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
          <Button onClick={() => void submit()} disabled={loading}>Add Knowledge</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[420px] pr-4">
            <div className="space-y-3">
              {sources.map((source) => (
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
                            <Button onClick={() => void saveEdit()}>Save</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" onClick={() => void remove(source.id)}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
