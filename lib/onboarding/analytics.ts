export type OnboardingBlockEventType = "block_viewed" | "block_completed" | "block_dropoff";

export function trackOnboardingBlockEvent(input: {
  blockId: string;
  eventType: OnboardingBlockEventType;
  metadata?: Record<string, unknown>;
}) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("onboarding:block-event", {
      detail: input,
    })
  );
}
