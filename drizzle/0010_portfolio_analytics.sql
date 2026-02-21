CREATE TABLE "portfolio_analytics" (
  "id" uuid PRIMARY KEY NOT NULL,
  "portfolio_id" uuid NOT NULL,
  "type" varchar(20) NOT NULL,
  "referrer" text,
  "user_agent" text,
  "country" varchar(2),
  "session_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "portfolio_analytics_portfolio_id_idx" ON "portfolio_analytics" USING btree ("portfolio_id");
--> statement-breakpoint
CREATE INDEX "portfolio_analytics_created_at_idx" ON "portfolio_analytics" USING btree ("created_at");
--> statement-breakpoint
ALTER TABLE "portfolio_analytics" ADD CONSTRAINT "portfolio_analytics_type_check" CHECK ("portfolio_analytics"."type" IN ('page_view', 'chat_session_start', 'chat_message'));
--> statement-breakpoint
ALTER TABLE "portfolio_analytics" ADD CONSTRAINT "portfolio_analytics_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;
