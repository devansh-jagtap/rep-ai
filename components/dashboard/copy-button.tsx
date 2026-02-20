"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export function CopyButton({ text }: { text: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast("Link copied to clipboard");
  };

  return (
    <Button variant="secondary" onClick={handleCopy}>
      <Copy className="size-4 mr-2" />
      Copy
    </Button>
  );
}
