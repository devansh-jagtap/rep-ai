ALTER TABLE "agents" ALTER COLUMN "portfolio_id" DROP NOT NULL;
--> statement-breakpoint
UPDATE "agents" AS "a"
SET "user_id" = "p"."user_id"
FROM "portfolios" AS "p"
WHERE "a"."portfolio_id" = "p"."id"
  AND "a"."user_id" IS NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "agents_user_id_standalone_unique"
ON "agents" USING btree ("user_id")
WHERE "portfolio_id" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agents_user_portfolio_lookup_idx"
ON "agents" USING btree ("user_id", "portfolio_id");
