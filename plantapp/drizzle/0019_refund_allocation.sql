-- Additive: partial refunds on multi-seller orders wait here for an admin to assign them to order lines.
-- No changes to existing rows. Not journaled. Applied by ensureAdditiveMigrations() after 0017 and 0018.

BEGIN;

CREATE TABLE IF NOT EXISTS "public"."refund_allocation" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"charge_id" text NOT NULL,
	"refunded_minor" bigint NOT NULL,
	"allocated_minor" bigint DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	"reason_code" text DEFAULT 'refund' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolved_by" text,
	CONSTRAINT "refund_allocation_order_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id"),
	CONSTRAINT "refund_allocation_status_check" CHECK ("status" IN ('needs_allocation', 'allocated')),
	CONSTRAINT "refund_allocation_reason_check" CHECK ("reason_code" IN ('refund', 'chargeback')),
	CONSTRAINT "refund_allocation_amount_check" CHECK ("refunded_minor" >= 0 AND "allocated_minor" >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS "refund_allocation_order_idx"
	ON "public"."refund_allocation" USING btree ("order_id");
CREATE INDEX IF NOT EXISTS "refund_allocation_status_idx"
	ON "public"."refund_allocation" USING btree ("status");

CREATE TABLE IF NOT EXISTS "public"."refund_allocation_line" (
	"id" text PRIMARY KEY NOT NULL,
	"allocation_id" text NOT NULL,
	"order_item_id" integer NOT NULL,
	"amount_minor" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refund_allocation_line_allocation_fk" FOREIGN KEY ("allocation_id") REFERENCES "public"."refund_allocation"("id"),
	CONSTRAINT "refund_allocation_line_item_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_item"("id"),
	CONSTRAINT "refund_allocation_line_amount_check" CHECK ("amount_minor" > 0)
);

CREATE INDEX IF NOT EXISTS "refund_allocation_line_allocation_idx"
	ON "public"."refund_allocation_line" USING btree ("allocation_id");

COMMIT;
