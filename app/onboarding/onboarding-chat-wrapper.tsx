"use client";

import dynamic from "next/dynamic";

const OnboardingChat = dynamic(
  () => import("@/app/onboarding/onboarding-chat").then((mod) => mod.OnboardingChat),
  { ssr: false }
);

export function OnboardingChatWrapper() {
  return <OnboardingChat />;
}
