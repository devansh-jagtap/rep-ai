import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OnboardingChat } from "@/app/onboarding/onboarding-chat";
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

  return (
    <main className="mx-auto max-w-3xl p-8">
      <OnboardingChat />
    </main>
  );
}
