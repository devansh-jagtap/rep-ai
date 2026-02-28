import { db } from "./lib/db";
import { agents } from "./lib/schema";
import { handlePublicChat } from "./lib/ai/public-chat-handler";
import { eq } from "drizzle-orm";

async function runTest() {
    const [agent] = await db.select().from(agents).limit(1);
    if (!agent) {
        console.log("No agent found to test with.");
        process.exit(0);
    }

    console.log("Testing with Agent ID:", agent.id);

    // Set working hours and off days
    await db.update(agents).set({
        workingHours: [
            { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", enabled: false }, // Sunday
            { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", enabled: false }, // Monday
            { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", enabled: false }, // Tuesday
            { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", enabled: false }, // Wednesday
            { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", enabled: false }, // Thursday
            { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", enabled: false }, // Friday
            { dayOfWeek: 6, startTime: "09:00", endTime: "17:00", enabled: false }, // Saturday
        ],
        offDays: ["2026-12-25"],
    }).where(eq(agents.id, agent.id));

    // Simulate a chat
    const result = await handlePublicChat({
        handle: null,
        agentId: agent.id,
        message: "Can we meet on Wednesday, March 11, 2026 at 2pm? Here is my project details. It's a very big project to build a mobile app, I have $10k budget. My email is alex@example.com",
        history: [],
        sessionId: "test-session-123",
        ip: "127.0.0.1",
        userId: null,
    });

    console.log("Result:", result);
    process.exit(0);
}

runTest().catch(console.error);
