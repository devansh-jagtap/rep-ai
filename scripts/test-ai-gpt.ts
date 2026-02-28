import { generateAgentReply } from "@/lib/ai/generate-agent-reply";

async function run() {
  const result = await generateAgentReply({
    agentId: "fb86253e-f79e-4c6c-abc1-fc7019929e15",
    model: "openai/gpt-4o-mini", // TESTING A DIFFERENT MODEL
    temperature: 0.5,
    message: "28th feb works for me ot 1st march",
    history: [
      { role: "user", content: "when is he free for meeting" },
      { role: "assistant", content: "I'd be happy to help you schedule a meeting with Atharva. To give you an accurate answer, could you please let me know which day or time you were thinking of? Once I have a date, I can check his calendar immediately.\n{\"lead_detected\":false,\"confidence\":0,\"lead_data\":{\"name\":\"\",\"email\":\"\",\"budget\":\"\",\"project_details\":\"\"}}" }
    ],
    strategyMode: "consultative",
    behaviorType: "friendly",
    customPrompt: null,
    displayName: "AI Assistant",
    avatarUrl: null,
    intro: "Hello",
    roleLabel: "Assistant"
  });
  console.log("FINAL RESULT:", JSON.stringify(result, null, 2));
}
run().catch(console.error);
