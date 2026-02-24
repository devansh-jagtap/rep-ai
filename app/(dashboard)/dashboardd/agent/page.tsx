import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AgentConfigForm } from "@/components/agent-config-form";
import { getActivePortfolio } from "@/lib/active-portfolio";
import { getAgentByPortfolioId } from "@/lib/agent/configure";
import { isConversationStrategyMode, type ConversationStrategyMode } from "@/lib/agent/strategy-modes";

export default async function AgentDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const portfolio = await getActivePortfolio(session.user.id);
  if (!portfolio) {
    redirect("/onboarding");
  }

  const agent = await getAgentByPortfolioId(portfolio.id);
  const strategyMode: ConversationStrategyMode =
    agent?.strategyMode && isConversationStrategyMode(String(agent.strategyMode))
      ? (String(agent.strategyMode) as ConversationStrategyMode)
      : "consultative";

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">AI Agent</h1>
      <p className="text-muted-foreground mt-2">Configure your public portfolio AI representative.</p>
      <AgentConfigForm
        initialConfig={{
          isEnabled: agent?.isEnabled ?? false,
          model: agent?.model ?? "moonshotai/Kimi-K2.5",
          behaviorType: agent?.behaviorType ?? "professional",
          strategyMode,
          customPrompt: agent?.customPrompt ?? "",
          temperature: agent?.temperature ?? 0.5,
        }}
      />
    </main>
  );
}
