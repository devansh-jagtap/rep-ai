ALTER TABLE "users" ADD COLUMN "billing_customer_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "billing_subscription_id" text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "active_portfolio_id";