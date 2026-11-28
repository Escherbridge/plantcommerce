-- Additive transfer attempts and affiliate batches. No changes to existing rows. Not journaled.

BEGIN;

CREATE TABLE IF NOT EXISTS "public"."payout_transfer" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"earning_id" text,
	"payout_id" text,
	"batch_id" text,
	"stripe_account_id" text,
	"amount_minor" bigint NOT NULL,
	"currency" varchar(3) NOT NULL,
	"status" text NOT NULL,
	"failure_reason" text,
	"idempotency_key" text NOT NULL,
	"stripe_transfer_id" text,
	"source_transaction" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payout_transfer_earning_id_fk" FOREIGN KEY ("earning_id") REFERENCES "public"."seller_earning"("id"),
	CONSTRAINT "payout_transfer_kind_check" CHECK ("kind" IN ('seller', 'affiliate')),
	CONSTRAINT "payout_transfer_status_check" CHECK ("status" IN ('pending', 'skipped', 'failed', 'succeeded', 'pending_approval'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "payout_transfer_idempotency_idx"
	ON "public"."payout_transfer" USING btree ("idempotency_key");
CREATE INDEX IF NOT EXISTS "payout_transfer_earning_idx" ON "public"."payout_transfer" USING btree ("earning_id");

CREATE TABLE IF NOT EXISTS "public"."affiliate_payout_batch" (
	"id" text PRIMARY KEY NOT NULL,
	"currency" varchar(3) NOT NULL,
	"total_minor" bigint NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone,
	"send_amount_minor" bigint,
	CONSTRAINT "affiliate_payout_batch_status_check" CHECK (
		"status" IN ('pending_approval', 'approved', 'sending', 'paid', 'skipped')
	)
);

CREATE INDEX IF NOT EXISTS "affiliate_payout_batch_status_idx"
	ON "public"."affiliate_payout_batch" USING btree ("status");

COMMIT;
