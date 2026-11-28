-- Additive charge id and transfer group on order. No changes to existing rows.
-- Numbered 0013 so it does not collide with 0012_manager_invites.sql on PR #49.
-- Applied on server startup by ensureAdditiveMigrations(). Not journaled.
-- See drizzle/AGENTS.md.

BEGIN;

-- "order" comes from the journaled baseline (0000), so it needs no existence guard. Each step is skipped when
-- already applied, so a later boot takes no lock on "order".
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'order' AND column_name = 'stripe_charge_id'
	) THEN
		ALTER TABLE "public"."order" ADD COLUMN "stripe_charge_id" text;
	END IF;
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'order' AND column_name = 'transfer_group'
	) THEN
		ALTER TABLE "public"."order" ADD COLUMN "transfer_group" text;
	END IF;
	IF to_regclass('public.order_stripe_charge_id_unique') IS NULL THEN
		CREATE UNIQUE INDEX "order_stripe_charge_id_unique"
			ON "public"."order" USING btree ("stripe_charge_id")
			WHERE "stripe_charge_id" IS NOT NULL;
	END IF;
END
$$;

COMMIT;
