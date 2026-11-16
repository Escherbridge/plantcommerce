-- Additive payout status flags. No bank or tax data. No changes to existing rows.
-- Applied on server startup by ensureAdditiveMigrations(). Not journaled.

BEGIN;

ALTER TABLE "public"."payout_account" ADD COLUMN IF NOT EXISTS "last_payout_status" text;
ALTER TABLE "public"."payout_account" ADD COLUMN IF NOT EXISTS "last_payout_at" timestamp with time zone;
ALTER TABLE "public"."payout_account" ADD COLUMN IF NOT EXISTS "external_account_updated_at" timestamp with time zone;

COMMIT;
