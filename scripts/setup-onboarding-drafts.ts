/**
 * Creates onboarding_drafts table if it doesn't exist.
 * Run: bun --env-file=.env.local scripts/setup-onboarding-drafts.ts
 */
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function main() {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS onboarding_drafts (
      user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      state jsonb NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    )
  `);
  console.log("onboarding_drafts table ready");
}

main().catch(console.error).finally(() => process.exit(0));
