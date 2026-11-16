-- Additive charge id and transfer group on order. No changes to existing rows.
-- Numbered 0013 so it does not collide with 0012_manager_invites.sql on PR #49.
-- Applied on server startup by ensureAdditiveMigrations(). Not journaled.
-- See drizzle/AGENTS.md.

BEGIN;

ALTER TABLE "public"."order" ADD COLUMN IF NOT EXISTS "stripe_charge_id" text;
ALTER TABLE "public"."order" ADD COLUMN IF NOT EXISTS "transfer_group" text;

CREATE UNIQUE INDEX IF NOT EXISTS "order_stripe_charge_id_unique"
	ON "public"."order" USING btree ("stripe_charge_id")
	WHERE "stripe_charge_id" IS NOT NULL;

COMMIT;
