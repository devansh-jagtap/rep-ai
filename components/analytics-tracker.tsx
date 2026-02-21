"use client";

import { useEffect, useRef } from "react";

interface AnalyticsTrackerProps {
  handle: string;
}

export function AnalyticsTracker({ handle }: AnalyticsTrackerProps) {
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    sessionId.current = crypto.randomUUID();

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        handle,
        type: "page_view",
        sessionId: sessionId.current,
      }),
    }).catch(() => {});
  }, [handle]);

  return null;
}
