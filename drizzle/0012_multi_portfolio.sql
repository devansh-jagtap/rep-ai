-- Step 1: Add the name column with a default so existing rows get a value
ALTER TABLE "portfolios" ADD COLUMN "name" varchar(80);

-- Step 2: Back-fill existing portfolios with a derived name from the handle
UPDATE "portfolios" SET "name" = INITCAP(REPLACE("handle", '-', ' ')) WHERE "name" IS NULL;

-- Step 3: Make the column NOT NULL now that all rows have a value
ALTER TABLE "portfolios" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "portfolios" ALTER COLUMN "name" SET DEFAULT 'My Portfolio';

-- Step 4: Drop unique constraints that enforced one portfolio per user
DROP INDEX IF EXISTS "portfolios_user_id_unique";
ALTER TABLE "portfolios" DROP CONSTRAINT IF EXISTS "portfolios_user_id_unique_constraint";

-- Step 5: Add active_portfolio_id to users table (can be null = no preference set yet)
ALTER TABLE "users" ADD COLUMN "active_portfolio_id" uuid REFERENCES "portfolios"("id") ON DELETE SET NULL;
