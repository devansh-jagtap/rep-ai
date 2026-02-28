import "dotenv/config";
import { db } from "../lib/db";
import { sessions } from "../lib/schema";
import { eq } from "drizzle-orm";

async function main() {
    try {
        console.log("Querying sessions...");
        const result = await db
            .select()
            .from(sessions)
            .where(eq(sessions.token, "test-token-123"))
            .execute();
        console.log("Result:", result);
    } catch (error) {
        console.error("Database query error:");
        console.error(error);
    }
}

main();
