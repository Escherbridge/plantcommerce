-- Source-only production catalog-reconciler recovery artifact.
-- See drizzle/AGENTS.md and catalogSeed/AGENTS.md before applying. It is intentionally not journaled.

BEGIN;
--> statement-breakpoint
DO $$
BEGIN
	IF to_regclass('public.product_category') IS NULL
		OR to_regclass('public.product') IS NULL
		OR to_regclass('public.file') IS NULL
		OR to_regclass('public.product_image') IS NULL THEN
		RAISE EXCEPTION 'The catalog reconciler requires product_category, product, file, and product_image tables';
	END IF;

	IF to_regclass('public.catalog_seed_category') IS NOT NULL
		OR to_regclass('public.catalog_seed_collection') IS NOT NULL
		OR to_regclass('public.catalog_seed_item') IS NOT NULL
		OR to_regclass('public.catalog_seed_run') IS NOT NULL THEN
		RAISE EXCEPTION 'A catalog seed reconciliation relation already exists; stop and reconcile the target-specific baseline';
	END IF;

	IF EXISTS (SELECT 1 FROM product WHERE price < 0 OR stock_quantity < 0 OR reserved_quantity < 0) THEN
		RAISE EXCEPTION 'Existing product commerce values are invalid; reconcile them before installing the catalog reconciler';
	END IF;
END $$;
--> statement-breakpoint
CREATE TABLE "catalog_seed_category" (
	"source_id" text PRIMARY KEY NOT NULL,
	"manifest_version" text NOT NULL,
	"manifest_hash" text NOT NULL,
	"category_id" integer NOT NULL REFERENCES "public"."product_category"("id") ON DELETE RESTRICT,
	"managed_snapshot" jsonb NOT NULL,
	"managed_hash" text NOT NULL,
	"is_retired" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_seed_category_manifest_hash_check" CHECK ("manifest_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "catalog_seed_category_managed_hash_check" CHECK ("managed_hash" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_seed_category_category_idx" ON "catalog_seed_category" USING btree ("category_id");
--> statement-breakpoint
CREATE INDEX "catalog_seed_category_retired_idx" ON "catalog_seed_category" USING btree ("is_retired");
--> statement-breakpoint
CREATE TABLE "catalog_seed_collection" (
	"source_id" text PRIMARY KEY NOT NULL,
	"manifest_version" text NOT NULL,
	"manifest_hash" text NOT NULL,
	"category_id" integer NOT NULL REFERENCES "public"."product_category"("id") ON DELETE RESTRICT,
	"managed_snapshot" jsonb NOT NULL,
	"managed_hash" text NOT NULL,
	"is_retired" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_seed_collection_manifest_hash_check" CHECK ("manifest_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "catalog_seed_collection_managed_hash_check" CHECK ("managed_hash" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_seed_collection_category_idx" ON "catalog_seed_collection" USING btree ("category_id");
--> statement-breakpoint
CREATE INDEX "catalog_seed_collection_retired_idx" ON "catalog_seed_collection" USING btree ("is_retired");
--> statement-breakpoint
CREATE TABLE "catalog_seed_item" (
	"source_id" text PRIMARY KEY NOT NULL,
	"manifest_version" text NOT NULL,
	"manifest_hash" text NOT NULL,
	"product_id" integer NOT NULL REFERENCES "public"."product"("id") ON DELETE RESTRICT,
	"offering_kind" text NOT NULL,
	"price_semantics" text NOT NULL,
	"managed_fields" jsonb NOT NULL,
	"managed_snapshot" jsonb NOT NULL,
	"managed_hash" text NOT NULL,
	"is_retired" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_seed_item_manifest_hash_check" CHECK ("manifest_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "catalog_seed_item_managed_hash_check" CHECK ("managed_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "catalog_seed_item_offering_kind_check" CHECK ("offering_kind" IN ('aevani_owned', 'affiliate_only', 'hybrid', 'educational')),
	CONSTRAINT "catalog_seed_item_price_semantics_check" CHECK ("price_semantics" IN ('unpriced', 'verified_price'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_seed_item_product_idx" ON "catalog_seed_item" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX "catalog_seed_item_retired_idx" ON "catalog_seed_item" USING btree ("is_retired");
--> statement-breakpoint
CREATE TABLE "catalog_seed_run" (
	"run_id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"status" text NOT NULL,
	"manifest_version" text NOT NULL,
	"manifest_hash" text NOT NULL,
	"release_id" text NOT NULL,
	"release_commit" text NOT NULL,
	"schema_fingerprint" text NOT NULL,
	"rollback_of_run_id" text REFERENCES "public"."catalog_seed_run"("run_id") ON DELETE RESTRICT,
	"preimage" jsonb NOT NULL,
	"changes" jsonb NOT NULL,
	"change_hash" text NOT NULL,
	"summary" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "catalog_seed_run_action_check" CHECK ("action" IN ('apply', 'rollback')),
	CONSTRAINT "catalog_seed_run_status_check" CHECK ("status" IN ('running', 'applied', 'rolled_back', 'failed')),
	CONSTRAINT "catalog_seed_run_manifest_hash_check" CHECK ("manifest_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "catalog_seed_run_change_hash_check" CHECK ("change_hash" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE INDEX "catalog_seed_run_created_idx" ON "catalog_seed_run" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "catalog_seed_run_manifest_idx" ON "catalog_seed_run" USING btree ("manifest_hash", "completed_at");
--> statement-breakpoint
COMMIT;
