-- Additive commission id list on an affiliate batch. No changes to existing rows.

BEGIN;

ALTER TABLE "public"."affiliate_payout_batch" ADD COLUMN IF NOT EXISTS "commission_ids" text;

COMMIT;
