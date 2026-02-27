CREATE TABLE IF NOT EXISTS "ai_telemetry_events" (
  "id" uuid PRIMARY KEY NOT NULL,
  "handle" varchar(255),
  "agent_id" uuid,
  "portfolio_id" uuid,
  "session_id" uuid,
  "event_type" varchar(64) NOT NULL,
  "model" varchar(120),
  "mode" varchar(32),
  "tokens_used" integer NOT NULL DEFAULT 0,
  "lead_detected" boolean NOT NULL DEFAULT false,
  "success" boolean NOT NULL DEFAULT true,
  "fallback_reason" varchar(255),
  "latency_ms" integer,
  "latency_bucket" varchar(32),
  "credit_cost" integer NOT NULL DEFAULT 0,
  "metadata" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "ai_telemetry_events_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_telemetry_events_event_type_idx" ON "ai_telemetry_events" USING btree ("event_type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_telemetry_events_created_at_idx" ON "ai_telemetry_events" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_telemetry_events_handle_idx" ON "ai_telemetry_events" USING btree ("handle");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_telemetry_events_session_id_idx" ON "ai_telemetry_events" USING btree ("session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_telemetry_events_model_mode_idx" ON "ai_telemetry_events" USING btree ("model", "mode");
