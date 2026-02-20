CREATE TABLE "agent_leads" (
	"id" uuid PRIMARY KEY NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"name" text,
	"email" text,
	"budget" text,
	"project_details" text,
	"confidence" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"model" varchar(80) NOT NULL,
	"behavior_type" varchar(40),
	"custom_prompt" text,
	"temperature" real DEFAULT 0.5 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agents_portfolio_id_unique_constraint" UNIQUE("portfolio_id"),
	CONSTRAINT "agents_temperature_range_check" CHECK ("agents"."temperature" BETWEEN 0.2 AND 0.8)
);
--> statement-breakpoint
ALTER TABLE "agent_leads" ADD CONSTRAINT "agent_leads_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agents_portfolio_id_unique" ON "agents" USING btree ("portfolio_id");--> statement-breakpoint
CREATE INDEX "agents_portfolio_id_idx" ON "agents" USING btree ("portfolio_id");