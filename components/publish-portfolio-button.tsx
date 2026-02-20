"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { toast } from "sonner";

export function PublishPortfolioButton({ handle, theme }: { handle: string; theme?: string }) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: theme }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success("Portfolio published successfully!");
        router.push(`/${handle}`);
      } else {
        toast.error(json.error ?? "Failed to publish portfolio");
      }
    } catch {
      toast.error("Failed to publish portfolio");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Button
      onClick={handlePublish}
      disabled={isPublishing}
      variant="default"
    >
      <Globe className="mr-1.5 size-4" />
      {isPublishing ? "Publishing…" : "Publish to Live"}
    </Button>
  );
}