import "dotenv/config";
import { db } from "../lib/db";
import { sessions } from "../lib/schema";
import { eq } from "drizzle-orm";

async function main() {
    try {
        console.log("Querying sessions...");
        const { betterAuth } = await import("better-auth");
        const { drizzleAdapter } = await import("better-auth/adapters/drizzle");
        const { users, sessions, accounts, verifications } = await import("../lib/schema");

        const authInstance = betterAuth({
            database: drizzleAdapter(db, {
                provider: "pg",
                schema: {
                    user: users,
                    session: sessions,
                    account: accounts,
                    verification: verifications,
                },
            }),
        });

        try {
            await authInstance.api.getSession({
                headers: new Headers({
                    cookie: "better-auth.session_token=test-token-123"
                })
            });
        } catch (err) {
            console.error(err);
        }
    } catch (error) {
        console.error("Database query error:");
        console.error(error);
    }
}

main();
