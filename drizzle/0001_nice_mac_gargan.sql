ALTER TABLE "portfolios" ADD COLUMN "handle" varchar(30);--> statement-breakpoint
ALTER TABLE "portfolios" ADD COLUMN "subdomain" varchar(30);--> statement-breakpoint
UPDATE "portfolios"
SET "handle" = substring(replace("user_id"::text, '-', '') from 1 for 30)
WHERE "handle" IS NULL;--> statement-breakpoint
ALTER TABLE "portfolios" ALTER COLUMN "handle" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "portfolios_handle_unique" ON "portfolios" USING btree ("handle");--> statement-breakpoint
CREATE UNIQUE INDEX "portfolios_subdomain_unique" ON "portfolios" USING btree ("subdomain");--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_unique_constraint" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_handle_unique_constraint" UNIQUE("handle");--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_subdomain_unique_constraint" UNIQUE("subdomain");--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_handle_format_check" CHECK ("portfolios"."handle" ~ '^[a-z0-9-]{3,30}$');--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_subdomain_format_check" CHECK ("portfolios"."subdomain" IS NULL OR "portfolios"."subdomain" ~ '^[a-z0-9-]{3,30}$');
