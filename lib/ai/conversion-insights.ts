import { generateObject } from "ai";
import { z } from "zod";
import { resolveChatModel } from "./model-provider";

export const conversionInsightSchema = z.object({
    top_objections: z.array(
        z.object({
            objection: z.string().describe("The core objection or concern raised by visitors."),
            severity: z.enum(["high", "medium", "low"]).describe("How critical this objection is to conversion."),
            frequency: z.number().describe("Estimated number of times this was raised."),
            recommendation: z.string().describe("Actionable advice to address this objection on the portfolio."),
        })
    ).describe("Clustered top objections from visitors."),
    most_asked_questions: z.array(
        z.object({
            question: z.string(),
            frequency: z.number(),
            suggested_answer: z.string().describe("A suggested answer to add to an FAQ or copy."),
        })
    ).describe("The most common questions asked by visitors."),
    drop_off_analysis: z.object({
        primary_drop_off_moment: z.string().describe("The typical point in the conversation where visitors leave (e.g., 'After being asked for budget')."),
        reasoning: z.string().describe("Why visitors are likely dropping off here."),
        fix_suggestion: z.string().describe("How to fix this drop-off moment (e.g., 'Offer a lower-friction next step')."),
    }).describe("Analysis of where and why visitors abandon the chat."),
    pricing_hesitation_analysis: z.object({
        hesitation_detected: z.boolean().describe("Whether pricing was a major point of friction."),
        percentage_affected: z.number().describe("Estimated percentage of users who showed pricing hesitation (0-100)."),
        context: z.string().describe("The context in which pricing was mentioned (e.g., 'Too expensive for small business')."),
        recommendation: z.string().describe("How to improve pricing framing or offer alternatives."),
    }).describe("Analysis of pricing-related friction."),
    hidden_trust_gaps: z.array(
        z.string().describe("Subtle trust issues or lacking information that prevent conversion (e.g., 'No case studies for e-commerce').")
    ).describe("Missing elements that cause visitors to hesitate."),
});

export type ConversionInsightResult = z.infer<typeof conversionInsightSchema>;

const SYSTEM_PROMPT = `You are a world-class Conversion Rate Optimization (CRO) consultant and Data Analyst.
Your task is to analyze chat logs between visitors and an AI agent on a professional portfolio website.
You need to identify patterns that prevent visitors from converting (e.g., booking a meeting, submitting a lead form).

Focus on:
1. Identifying and clustering the top objections visitors have.
2. Finding the most frequently asked questions.
3. Pinpointing the exact moments visitors drop off and why.
4. Detecting pricing hesitations and evaluating their impact.
5. Identifying "hidden trust gaps" — things the visitor needs to see but isn't finding.

RULES:
- Be highly analytical and objective.
- Do NOT hallucinate metrics. Base "frequency" and "percentage_affected" on reasonable approximations from the provided data.
- Provide highly actionable, specific recommendations for the portfolio owner.
- Return ONLY valid JSON matching the exact schema provided. No markdown blocks, no preamble.`;

export async function generateConversionInsights(chatLogsText: string): Promise<ConversionInsightResult> {
    if (!chatLogsText || chatLogsText.trim().length === 0) {
        throw new Error("Chat logs are empty.");
    }

    const model = resolveChatModel("google/gemini-3-flash");

    const { object } = await generateObject({
        model,
        schema: conversionInsightSchema,
        system: SYSTEM_PROMPT,
        prompt: `Analyze the following chat logs and generate conversion insights.\n\n<chat_logs>\n${chatLogsText}\n</chat_logs>`,
    });

    return object;
}
