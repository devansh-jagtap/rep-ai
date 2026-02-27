ALTER TABLE "agent_leads" ADD COLUMN "agent_id" uuid;

UPDATE "agent_leads" al
SET "agent_id" = a."id"
FROM "agents" a
WHERE a."portfolio_id" = al."portfolio_id";

ALTER TABLE "agent_leads" ALTER COLUMN "agent_id" SET NOT NULL;
ALTER TABLE "agent_leads" ADD CONSTRAINT "agent_leads_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "agent_leads" ALTER COLUMN "portfolio_id" DROP NOT NULL;
