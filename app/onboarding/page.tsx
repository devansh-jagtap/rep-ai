import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OnboardingChatWrapper } from "@/app/onboarding/onboarding-chat-wrapper";
import { getPortfolioByUserId } from "@/lib/db/portfolio";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/onboarding");
  }

  const portfolio = await getPortfolioByUserId(session.user.id);
  if (portfolio) {
    redirect("/dashboard");
  }

  return <OnboardingChatWrapper />;
}
