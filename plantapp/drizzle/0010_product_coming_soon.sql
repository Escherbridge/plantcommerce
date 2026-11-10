-- Additive nullable purchase gate for placeholder catalogue rows.
-- Existing rows stay NULL. NULL and true are coming soon (not purchasable).
-- false is the only explicitly sellable state. No data updates, no drops.
-- Applied on server startup by ensureAdditiveMigrations(). Not journaled.
-- See drizzle/AGENTS.md.

BEGIN;

ALTER TABLE "public"."product" ADD COLUMN IF NOT EXISTS "coming_soon" boolean;

COMMIT;
