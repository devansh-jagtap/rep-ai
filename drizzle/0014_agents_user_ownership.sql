ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "user_id" uuid;
--> statement-breakpoint
UPDATE "agents" AS "a"
SET "user_id" = "p"."user_id"
FROM "portfolios" AS "p"
WHERE "a"."portfolio_id" = "p"."id"
  AND "a"."user_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "agents" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agents_user_id_idx" ON "agents" USING btree ("user_id");
