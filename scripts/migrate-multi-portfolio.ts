/**
 * Migration: Add multi-portfolio support
 *
 * What this does:
 *  1. Adds `name` column to portfolios (back-fills from handle)
 *  2. Removes the unique constraint that enforced one portfolio per user
 *  3. Adds `active_portfolio_id` column to users
 *
 * Run with:
 *   bun --env-file=.env scripts/migrate-multi-portfolio.ts
 */
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
}

const sql = postgres(databaseUrl, { prepare: false });

async function main() {
    console.log("▶ Starting multi-portfolio migration...\n");

    // ── 1. Add `name` column to portfolios ──────────────────────────────────
    const nameColExists = await sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'portfolios' AND column_name = 'name'
  `;

    if (nameColExists.length === 0) {
        console.log("  Adding `name` column to portfolios...");
        await sql`ALTER TABLE "portfolios" ADD COLUMN "name" varchar(80) NOT NULL DEFAULT 'My Portfolio'`;
        // Back-fill with a human-friendly version of the handle
        await sql`
      UPDATE "portfolios"
      SET "name" = INITCAP(REPLACE("handle", '-', ' '))
      WHERE "name" = 'My Portfolio'
    `;
        console.log("  ✓ name column added and back-filled");
    } else {
        console.log("  ✓ name column already exists, skipping");
    }

    // ── 2. Drop unique constraint on portfolios.user_id ─────────────────────
    // Check if the constraint exists before trying to drop it
    const constraintExists = await sql`
    SELECT 1 FROM pg_constraint
    WHERE conname = 'portfolios_user_id_unique_constraint'
  `;

    if (constraintExists.length > 0) {
        console.log("  Dropping portfolios_user_id_unique_constraint...");
        await sql`ALTER TABLE "portfolios" DROP CONSTRAINT "portfolios_user_id_unique_constraint"`;
        console.log("  ✓ Unique-per-user constraint removed");
    } else {
        console.log("  ✓ Unique-per-user constraint already removed, skipping");
    }

    // Drop the unique index too (drizzle creates both)
    const indexExists = await sql`
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'portfolios' AND indexname = 'portfolios_user_id_unique'
  `;

    if (indexExists.length > 0) {
        console.log("  Dropping portfolios_user_id_unique index...");
        await sql`DROP INDEX IF EXISTS "portfolios_user_id_unique"`;
        console.log("  ✓ Unique index dropped");
    } else {
        console.log("  ✓ Unique index already removed, skipping");
    }

    // ── 3. Add `active_portfolio_id` to users ───────────────────────────────
    const activePidColExists = await sql`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'active_portfolio_id'
  `;

    if (activePidColExists.length === 0) {
        console.log("  Adding active_portfolio_id column to users...");
        await sql`ALTER TABLE "users" ADD COLUMN "active_portfolio_id" uuid REFERENCES "portfolios"("id") ON DELETE SET NULL`;
        console.log("  ✓ active_portfolio_id column added");
    } else {
        console.log("  ✓ active_portfolio_id already exists, skipping");
    }

    console.log("\n✅ Multi-portfolio migration complete!\n");
}

main()
    .catch((err) => {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    })
    .finally(() => sql.end());
