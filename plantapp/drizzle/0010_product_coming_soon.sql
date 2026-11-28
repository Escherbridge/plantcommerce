-- Additive nullable purchase gate for placeholder catalogue rows.
-- Existing rows stay NULL. NULL and true are coming soon (not purchasable).
-- false is the only explicitly sellable state. No data updates, no drops.
-- Applied on server startup by ensureAdditiveMigrations(). Not journaled.
-- See drizzle/AGENTS.md.

BEGIN;

-- Guarded so a boot after the column exists takes no table lock.
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'product' AND column_name = 'coming_soon'
	) THEN
		ALTER TABLE "public"."product" ADD COLUMN "coming_soon" boolean;
	END IF;
END
$$;

COMMIT;
