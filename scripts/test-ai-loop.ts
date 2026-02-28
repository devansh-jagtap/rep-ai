import { generateText, tool } from "ai";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";

const gateway = createOpenAI({
    apiKey: process.env.AI_GATEWAY_API_KEY,
    baseURL: process.env.AI_GATEWAY_BASE_URL ?? "https://ai-gateway.vercel.sh/v1",
});

async function run() {
    console.log("Starting minimal test...");
    try {
        const result = await generateText({
            model: gateway.chat("google/gemini-3-flash"),
            prompt: "What is 5 + 7? Use the calculator tool.",
            maxToolRoundtrips: 5,
            tools: {
                calculator: tool({
                    description: "A simple calculator to evaluate mathematical expressions.",
                    parameters: z.object({
                        expression: z.string().describe("The math expression to calculate (e.g. 5+7)"),
                    }),
                    execute: async ({ expression }) => {
                        console.log(`[tool:calculator] called with ${expression}`);
                        return `Result of ${expression} is 12`;
                    },
                }),
            },
        });

        console.log("Keys in result:", Object.keys(result));
        if ('response' in result) {
            console.log("Keys in result.response:", Object.keys((result as any).response));
        }
        if ('responseMessages' in result) {
            console.log("Has responseMessages");
        }

        console.log("Final text:", result.text);
        console.log("Steps taken:", result.steps?.length);
    } catch (err: any) {
        console.error("Error:", err.message, err.stack);
    }
}

run();
