ALTER TABLE "portfolios"
ADD COLUMN IF NOT EXISTS "template" varchar(30) DEFAULT 'modern' NOT NULL;
