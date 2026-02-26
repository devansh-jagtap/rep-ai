CREATE TABLE IF NOT EXISTS "lead_chat_messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"lead_id" uuid,
	"session_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "knowledge_sources" DROP CONSTRAINT IF EXISTS "knowledge_sources_type_check";--> statement-breakpoint
ALTER TABLE "agent_leads" ADD COLUMN IF NOT EXISTS "session_id" uuid;--> statement-breakpoint
ALTER TABLE "knowledge_sources" ADD COLUMN IF NOT EXISTS "file_url" text;--> statement-breakpoint
ALTER TABLE "knowledge_sources" ADD COLUMN IF NOT EXISTS "file_size" integer;--> statement-breakpoint
ALTER TABLE "knowledge_sources" ADD COLUMN IF NOT EXISTS "mime_type" varchar(50);--> statement-breakpoint
ALTER TABLE "knowledge_sources" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'complete' NOT NULL;--> statement-breakpoint
ALTER TABLE "lead_chat_messages" ADD CONSTRAINT "lead_chat_messages_lead_id_agent_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."agent_leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lead_chat_messages_session_id_idx" ON "lead_chat_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lead_chat_messages_lead_id_idx" ON "lead_chat_messages" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "knowledge_sources_status_idx" ON "knowledge_sources" USING btree ("status");--> statement-breakpoint
ALTER TABLE "knowledge_sources" DROP CONSTRAINT IF EXISTS "knowledge_sources_status_check";--> statement-breakpoint
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_status_check" CHECK ("knowledge_sources"."status" IN ('pending', 'processing', 'complete', 'failed'));--> statement-breakpoint
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_type_check" CHECK ("knowledge_sources"."type" IN ('text', 'pdf'));