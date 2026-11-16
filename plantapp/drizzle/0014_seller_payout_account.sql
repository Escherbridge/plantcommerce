-- Additive seller ownership and Connect account records. No changes to existing rows.
-- Applied on server startup by ensureAdditiveMigrations(). Not journaled.
-- See drizzle/AGENTS.md.

BEGIN;

CREATE TABLE IF NOT EXISTS "public"."seller" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seller_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id"),
	CONSTRAINT "seller_status_check" CHECK ("status" IN ('pending', 'active', 'suspended'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "seller_user_idx" ON "public"."seller" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "seller_status_idx" ON "public"."seller" USING btree ("status");

CREATE TABLE IF NOT EXISTS "public"."payout_account" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_type" text NOT NULL,
	"seller_id" integer,
	"affiliate_id" integer,
	"stripe_account_id" text,
	"country" varchar(2),
	"transfers_active" boolean DEFAULT false NOT NULL,
	"requirements_due" boolean DEFAULT false NOT NULL,
	"disabled_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payout_account_seller_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id"),
	CONSTRAINT "payout_account_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliate"("id"),
	CONSTRAINT "payout_account_owner_type_check" CHECK ("owner_type" IN ('seller', 'affiliate')),
	CONSTRAINT "payout_account_owner_check" CHECK (
		("owner_type" = 'seller' AND "seller_id" IS NOT NULL AND "affiliate_id" IS NULL)
		OR ("owner_type" = 'affiliate' AND "affiliate_id" IS NOT NULL AND "seller_id" IS NULL)
	),
	CONSTRAINT "payout_account_country_check" CHECK ("country" IS NULL OR "country" = 'US')
);

CREATE UNIQUE INDEX IF NOT EXISTS "payout_account_seller_idx"
	ON "public"."payout_account" USING btree ("seller_id") WHERE "seller_id" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "payout_account_affiliate_idx"
	ON "public"."payout_account" USING btree ("affiliate_id") WHERE "affiliate_id" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "payout_account_stripe_account_idx"
	ON "public"."payout_account" USING btree ("stripe_account_id") WHERE "stripe_account_id" IS NOT NULL;

ALTER TABLE "public"."product" ADD COLUMN IF NOT EXISTS "seller_id" integer;
ALTER TABLE "public"."checkout_draft_item" ADD COLUMN IF NOT EXISTS "seller_id" integer;
ALTER TABLE "public"."order_item" ADD COLUMN IF NOT EXISTS "seller_id" integer;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_seller_id_seller_id_fk') THEN
		ALTER TABLE "public"."product"
			ADD CONSTRAINT "product_seller_id_seller_id_fk"
			FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id");
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'checkout_draft_item_seller_id_fk') THEN
		ALTER TABLE "public"."checkout_draft_item"
			ADD CONSTRAINT "checkout_draft_item_seller_id_fk"
			FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id");
	END IF;
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_item_seller_id_fk') THEN
		ALTER TABLE "public"."order_item"
			ADD CONSTRAINT "order_item_seller_id_fk"
			FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id");
	END IF;
END $$;

CREATE INDEX IF NOT EXISTS "product_seller_idx" ON "public"."product" USING btree ("seller_id");
CREATE INDEX IF NOT EXISTS "checkout_draft_item_seller_idx" ON "public"."checkout_draft_item" USING btree ("seller_id");
CREATE INDEX IF NOT EXISTS "order_item_seller_idx" ON "public"."order_item" USING btree ("seller_id");

COMMIT;
