CREATE TABLE IF NOT EXISTS "knowledge_chunks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"chunk_text" text NOT NULL,
	"embedding" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "knowledge_sources" (
	"id" uuid PRIMARY KEY NOT NULL,
	"agent_id" uuid NOT NULL,
	"title" varchar(160) NOT NULL,
	"type" varchar(20) DEFAULT 'text' NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_sources_type_check" CHECK ("knowledge_sources"."type" IN ('text'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "portfolio_analytics" (
	"id" uuid PRIMARY KEY NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"referrer" text,
	"user_agent" text,
	"country" varchar(2),
	"session_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_analytics_type_check" CHECK ("portfolio_analytics"."type" IN ('page_view', 'chat_session_start', 'chat_message'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
DROP TABLE IF EXISTS "verification_tokens" CASCADE;--> statement-breakpoint
ALTER TABLE "portfolios" DROP CONSTRAINT IF EXISTS "portfolios_user_id_unique_constraint";--> statement-breakpoint
DROP INDEX IF EXISTS "portfolios_user_id_unique";--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_provider_provider_account_id_pk";--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'sessions'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "sessions" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "credits" SET DEFAULT 500;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "id" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "account_id" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "provider_id" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "access_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "password" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "created_at" timestamp NOT NULL DEFAULT now();--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "updated_at" timestamp NOT NULL DEFAULT now();--> statement-breakpoint
ALTER TABLE "agent_leads" ADD COLUMN IF NOT EXISTS "conversation_summary" text;--> statement-breakpoint
ALTER TABLE "agent_leads" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_leads" ADD COLUMN IF NOT EXISTS "is_read" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolios" ADD COLUMN IF NOT EXISTS "name" varchar(80) DEFAULT 'My Portfolio' NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "id" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "expires_at" timestamp NOT NULL DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "active_portfolio_id" uuid;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'knowledge_chunks_source_id_knowledge_sources_id_fk') THEN
    ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_source_id_knowledge_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."knowledge_sources"("id") ON DELETE cascade ON UPDATE no action;
  END IF; END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'knowledge_chunks_agent_id_agents_id_fk') THEN
    ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  END IF; END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'knowledge_sources_agent_id_agents_id_fk') THEN
    ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
  END IF; END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'portfolio_analytics_portfolio_id_portfolios_id_fk') THEN
    ALTER TABLE "portfolio_analytics" ADD CONSTRAINT "portfolio_analytics_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;
  END IF; END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "knowledge_chunks_agent_id_idx" ON "knowledge_chunks" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "knowledge_chunks_source_id_idx" ON "knowledge_chunks" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "knowledge_sources_agent_id_idx" ON "knowledge_sources" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "portfolio_analytics_portfolio_id_idx" ON "portfolio_analytics" USING btree ("portfolio_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "portfolio_analytics_created_at_idx" ON "portfolio_analytics" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verifications" USING btree ("identifier","value");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "account_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "account_provider_id_idx" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN IF EXISTS "type";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN IF EXISTS "provider";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN IF EXISTS "provider_account_id";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN IF EXISTS "expires_at";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN IF EXISTS "token_type";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN IF EXISTS "session_state";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "expires";--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_session_token_unique') THEN
    ALTER TABLE "sessions" ADD CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token");
  END IF; END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agent_leads_status_check') THEN
    ALTER TABLE "agent_leads" ADD CONSTRAINT "agent_leads_status_check" CHECK ("agent_leads"."status" IN ('new', 'contacted', 'closed'));
  END IF; END $$;