import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
    try {
        console.log("Querying sessions...");
        const res = await db.execute(sql`
      select "id", "session_token", "user_id", "expires_at", "created_at", "updated_at", "ip_address", "user_agent" 
      from "sessions" 
      where "sessions"."session_token" = 'tYWyA6wk0kGPji5uo82cFZvtpNvJL5gx'
    `);
        console.log("Result:", res);
    } catch (error) {
        console.error("Database query error:");
        console.error(error);
    } finally {
        process.exit(0);
    }
}

main();
