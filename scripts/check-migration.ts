/**
 * Quick DB diagnostics — verify multi-portfolio migration columns exist.
 * Run: bun --env-file=.env scripts/check-migration.ts
 */
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) { console.error("DATABASE_URL required"); process.exit(1); }

const sql = postgres(databaseUrl, { prepare: false });

async function main() {
    const portfolioCols = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'portfolios'
    ORDER BY ordinal_position
  `;
    console.log("portfolios columns:", portfolioCols.map(c => c.column_name).join(", "));

    const userCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'active_portfolio_id'
  `;
    console.log("users.active_portfolio_id exists:", userCols.length > 0);

    const [sample] = await sql`SELECT id, name, handle FROM portfolios LIMIT 1`;
    console.log("Sample portfolio:", sample ?? "none");
}

main().catch(console.error).finally(() => sql.end());
