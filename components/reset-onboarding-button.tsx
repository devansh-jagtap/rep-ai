"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcwIcon } from "lucide-react";

export function ResetOnboardingButton() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      const res = await fetch("/api/portfolio", { method: "DELETE", credentials: "include" });
      const json = (await res.json()) as { ok?: boolean };
      if (json.ok) {
        router.push("/onboarding");
      } else {
        setIsResetting(false);
      }
    } catch {
      setIsResetting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleReset}
      disabled={isResetting}
      className="text-muted-foreground"
    >
      <RotateCcwIcon className="mr-1.5 size-4" />
      {isResetting ? "Resetting…" : "Start over"}
    </Button>
  );
}
