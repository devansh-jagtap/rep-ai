import { redirect } from "next/navigation";
import { getSession } from "@/auth";
import { OnboardingChatWrapper } from "@/app/onboarding/onboarding-chat-wrapper";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/onboarding");
  }

  // Allow any authenticated user to reach onboarding — they may be creating
  // an additional portfolio. The old guard that blocked existing users has
  // been removed as part of multi-portfolio support.
  return <OnboardingChatWrapper />;
}
