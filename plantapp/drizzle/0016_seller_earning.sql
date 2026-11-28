-- Additive seller earnings ledger, delivery timestamps, and balance holds.
-- No changes to existing rows. Not journaled.

BEGIN;

-- "order" is in the journaled baseline (0000). Columns are added only when missing, so later boots take no lock.
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'order' AND column_name = 'shipped_at'
	) THEN
		ALTER TABLE "public"."order" ADD COLUMN "shipped_at" timestamp with time zone;
	END IF;
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'order' AND column_name = 'delivered_at'
	) THEN
		ALTER TABLE "public"."order" ADD COLUMN "delivered_at" timestamp with time zone;
	END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "public"."seller_earning" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"seller_id" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"line_total_minor" bigint NOT NULL,
	"shipping_passthrough_minor" bigint DEFAULT 0 NOT NULL,
	"fee_bps" integer NOT NULL,
	"fee_minor" bigint NOT NULL,
	"net_minor" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seller_earning_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id"),
	CONSTRAINT "seller_earning_seller_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id"),
	CONSTRAINT "seller_earning_fee_bps_check" CHECK ("fee_bps" = 800),
	CONSTRAINT "seller_earning_amounts_check" CHECK (
		"line_total_minor" >= 0
		AND "shipping_passthrough_minor" >= 0
		AND "fee_minor" >= 0
		AND "net_minor" >= 0
		AND "net_minor" = "line_total_minor" + "shipping_passthrough_minor" - "fee_minor"
	)
);

CREATE UNIQUE INDEX IF NOT EXISTS "seller_earning_order_seller_idx"
	ON "public"."seller_earning" USING btree ("order_id", "seller_id");
CREATE INDEX IF NOT EXISTS "seller_earning_seller_idx" ON "public"."seller_earning" USING btree ("seller_id");

CREATE TABLE IF NOT EXISTS "public"."seller_earning_event" (
	"id" text PRIMARY KEY NOT NULL,
	"earning_id" text NOT NULL,
	"event_type" text NOT NULL,
	"amount_delta_minor" bigint NOT NULL,
	"currency" varchar(3) NOT NULL,
	"event_reference" text NOT NULL,
	"causation_reference" text,
	"reason_code" text,
	"credits_reference" text,
	"stripe_transfer_id" text,
	"stripe_reversal_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seller_earning_event_earning_id_fk" FOREIGN KEY ("earning_id") REFERENCES "public"."seller_earning"("id"),
	CONSTRAINT "seller_earning_event_type_check" CHECK (
		"event_type" IN (
			'pending', 'held', 'released', 'transferred', 'reversed', 'debt',
			'reversal_credited', 'debt_credited', 'fee_credited'
		)
	)
);

CREATE UNIQUE INDEX IF NOT EXISTS "seller_earning_event_reference_idx"
	ON "public"."seller_earning_event" USING btree ("event_reference");
CREATE INDEX IF NOT EXISTS "seller_earning_event_earning_idx"
	ON "public"."seller_earning_event" USING btree ("earning_id", "created_at");

CREATE TABLE IF NOT EXISTS "public"."order_balance_hold" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"kind" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"stripe_object_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	CONSTRAINT "order_balance_hold_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id"),
	CONSTRAINT "order_balance_hold_kind_check" CHECK ("kind" IN ('refund', 'dispute')),
	CONSTRAINT "order_balance_hold_status_check" CHECK ("status" IN ('open', 'closed'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "order_balance_hold_stripe_object_idx"
	ON "public"."order_balance_hold" USING btree ("stripe_object_id");
CREATE INDEX IF NOT EXISTS "order_balance_hold_order_status_idx"
	ON "public"."order_balance_hold" USING btree ("order_id", "status");

COMMIT;
