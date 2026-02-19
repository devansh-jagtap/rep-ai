CREATE TABLE "onboarding_drafts" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"state" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "onboarding_drafts" ADD CONSTRAINT "onboarding_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;