-- Migration: Add Google Calendar integration fields to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS google_calendar_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS google_calendar_access_token text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS google_calendar_refresh_token text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS google_calendar_token_expiry timestamp with time zone;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS google_calendar_account_email varchar(255);
