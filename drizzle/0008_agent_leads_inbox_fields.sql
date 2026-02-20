ALTER TABLE "agent_leads" ADD COLUMN "conversation_summary" text;--> statement-breakpoint
ALTER TABLE "agent_leads" ADD COLUMN "status" varchar(20) DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_leads" ADD COLUMN "is_read" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_leads" ADD CONSTRAINT "agent_leads_status_check" CHECK ("agent_leads"."status" IN ('new','contacted','closed'));
