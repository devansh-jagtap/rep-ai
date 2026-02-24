import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import type { UIMessage } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { onboardingDrafts } from "@/lib/schema";
import { getPortfolioByHandle } from "@/lib/db/portfolio";
import type { OnboardingData, OnboardingStep } from "@/lib/onboarding/types";
import {
  validateFinalOnboardingState,
  validateStepInput,
} from "@/lib/onboarding/validation";
import { ONBOARDING_STEPS } from "@/lib/onboarding/types";

const nebius = createOpenAI({
  apiKey: process.env.NEBIUS_API_KEY,
  baseURL: process.env.NEBIUS_BASE_URL ?? "https://api.studio.nebius.com/v1",
});

const MODEL = process.env.NEBIUS_MODEL ?? "moonshotai/Kimi-K2.5";

function buildSystemPrompt(collected: Partial<OnboardingData>): string {
  const steps = ONBOARDING_STEPS;
  const collectedKeys = Object.keys(collected) as OnboardingStep[];
  const nextStep = steps.find((s) => !collectedKeys.includes(s)) ?? null;

  const stateDesc =
    Object.keys(collected).length === 0
      ? "Nothing collected yet."
      : JSON.stringify(collected, null, 2);

  return `You are a friendly, chill onboarding assistant for ref, a portfolio platform. Your job is to collect the following information from the user in this exact order.

**Tone & boundaries:**
- Always be friendly, warm, and chill. Keep it casual and approachable.
- Stay focused on onboarding only. If the user asks random questions, jokes around, or goes off-topic, gently redirect: "Haha, I'd love to chat about that later! For now let's get your portfolio set up—[current question]." Never answer unrelated questions.
- Keep responses SHORT. 1–2 sentences max. Never repeat or summarize content the user just gave—they can see it. No fluff.

1. **setupPath** - Ask this first with human-friendly labels:
   - "I already have a website" (agent only)
   - "Build me a portfolio + agent" (from scratch)
2. **name** - Full name for their portfolio (2-80 chars)
3. **title** - Professional title (2-100 chars)
4. **bio** - Elevator pitch / short bio, at least 20 characters, max 400
5. **services** - Services/work offered (comma or newline separated, at least one)
6. **projects** - ONLY for build-new path: 1-3 projects as "Title: Description" on new lines
7. **siteUrl** - ONLY for existing-site path: website URL to ingest
8. **targetAudience** - ONLY for existing-site path
9. **contactPreferences** - ONLY for existing-site path
10. **faqs** - ONLY for existing-site path, one per line
11. **tone** - One of: Professional, Friendly, Bold, Minimal
12. **handle** - Public URL handle (3-30 chars, lowercase letters, numbers, hyphens only)

**Collected so far:**
${stateDesc}

**Current step to collect:** ${nextStep ?? "All done"}

**Your flow for each step:**
1. Ask for the information (or if you have it from context, skip to step 2)
2. Optionally refine or clean up the user's answer for clarity and professionalism
3. Show the refined value and ask: "Is that correct?" or "Should I use this?"
4. When the user confirms (yes, correct, looks good, etc.), call save_step with the step name and the confirmed value
5. **CRITICAL: Always respond in the same turn.** After save_step, immediately ask for the next step. Never leave the user without a response. Example: after saving name, say "Saved! What's your professional title?"

**Special rules:**
- **Combined messages:** If the user confirms AND gives the next answer in one message (e.g. "yes developer" when confirming name), save the current step, then treat the rest as the next step's answer. E.g. save name, then ask "So your title is Developer—is that correct?"
- For **services**: parse into an array of strings (comma or newline separated)
- For **projects**: parse into array of { title, description } objects. Format: "Title: Description" per line. Need 1-3 projects for build-new path only.
- For **handle**: must be unique - if taken, ask user to pick another
- If the user's input is invalid, explain what you need and ask again in a friendly way.
- When required fields for the chosen path are collected and confirmed, call request_preview with the full data. Do NOT call complete_onboarding—the user will confirm via the preview UI.
- **CRITICAL for request_preview:** Keep your message SHORT. Say ONLY: "Everything look good? Click Confirm below to make it live!" or similar. Do NOT repeat the user's bio, projects, services, or any of their data. The preview card shows it all—your message should be one brief line only.
- **EDIT REQUESTS:** If the user has already seen the preview and sends a new message (e.g. "shorten the bio", "change title to Senior Developer", "make the tone more friendly"), they want to edit. Parse their request, update the relevant field(s) via save_step with the new value, then call request_preview again with the full updated data. Keep your reply to one short line.`;
}

export async function streamOnboardingChat({
  userId,
  messages,
  collected,
}: {
  userId: string;
  messages: UIMessage[];
  collected: Partial<OnboardingData>;
}) {
  const systemPrompt = buildSystemPrompt(collected);
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: nebius.chat(MODEL),
    system: systemPrompt,
    messages: modelMessages,
    stopWhen: stepCountIs(15),
    onError: ({ error }) => {
      console.error("[onboarding-agent] streamText error:", error);
    },
    tools: {
      save_step: tool({
        description: "Save a confirmed onboarding step. Call when user confirms a value.",
        inputSchema: z.object({
          step: z.enum([
            "setupPath",
            "name",
            "title",
            "bio",
            "services",
            "projects",
            "siteUrl",
            "targetAudience",
            "contactPreferences",
            "faqs",
            "tone",
            "handle",
          ]),
          value: z.union([
            z.string(),
            z.array(z.string()),
            z.array(
              z.object({
                title: z.string(),
                description: z.string(),
              })
            ),
          ]),
        }),
        execute: async ({ step, value }) => {
          const stringValue =
            typeof value === "string"
              ? value
              : step === "services"
                ? (value as string[]).join(", ")
                : step === "projects"
                  ? (value as { title: string; description: string }[])
                      .map((p) => `${p.title}: ${p.description}`)
                      .join("\n")
                  : step === "faqs"
                    ? (value as string[]).join("\n")
                    : String(value);

          const validation = validateStepInput(step as OnboardingStep, stringValue);
          if (!validation.ok) {
            return { success: false, error: validation.message };
          }

          const parsedValue = validation.value;
          const merged = { ...collected, [step]: parsedValue };

          try {
            await db
              .insert(onboardingDrafts)
              .values({
                userId,
                state: merged as Record<string, unknown>,
                updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                target: onboardingDrafts.userId,
                set: {
                  state: merged as Record<string, unknown>,
                  updatedAt: new Date(),
                },
              });
          } catch (dbErr) {
            console.error("save_step db error (table may not exist):", dbErr);
          }

          return { success: true, message: `Saved ${step}` };
        },
      }),
      request_preview: tool({
        description:
          "Call when required onboarding fields are collected for the selected setup path. Returns data for preview UI. Do NOT call complete_onboarding.",
        inputSchema: z.object({
          name: z.string(),
          title: z.string(),
          bio: z.string(),
          services: z.array(z.string()),
          projects: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
            })
          ).optional(),
          setupPath: z.enum(["existing-site", "build-new"]),
          siteUrl: z.string().optional(),
          targetAudience: z.string().optional(),
          contactPreferences: z.string().optional(),
          faqs: z.array(z.string()).optional(),
          tone: z.enum(["Professional", "Friendly", "Bold", "Minimal"]),
          handle: z.string(),
        }),
        execute: async (data) => {
          console.log("[request_preview] execute called with:", data);
          const parsed = validateFinalOnboardingState(data);
          if (!parsed.ok) {
            console.error("[request_preview] validation failed:", parsed.message);
            return { preview: false, error: parsed.message };
          }
          const finalState = parsed.value;
          const taken = await getPortfolioByHandle(finalState.handle);
          if (taken) {
            console.warn("[request_preview] handle taken:", finalState.handle);
            return {
              preview: false,
              error: "This handle is already taken. Please choose another one.",
            };
          }
          console.log("[request_preview] success!");
          return { preview: true, data: finalState };
        },
      }),
    },
  });

  return result;
}
