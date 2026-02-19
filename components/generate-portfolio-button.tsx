"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function GeneratePortfolioButton() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-portfolio", {
        method: "POST",
        credentials: "include",
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (json.ok) {
        router.refresh();
      } else {
        setError(json.error ?? "Failed to generate portfolio");
      }
    } catch {
      setError("Failed to generate portfolio");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        <Sparkles className="mr-1.5 size-4" />
        {isGenerating ? "Generating…" : "Generate with AI"}
      </Button>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
