-- Run this if onboarding_drafts table doesn't exist:
-- bun --env-file=.env.local -e "const {db}=require('./lib/db'); require('drizzle-orm').sql\`CREATE TABLE IF NOT EXISTS onboarding_drafts (user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, state jsonb NOT NULL, updated_at timestamp DEFAULT now() NOT NULL)\`.execute(db)"

CREATE TABLE IF NOT EXISTS onboarding_drafts (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  state jsonb NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);
