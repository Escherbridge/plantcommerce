-- Source-only additive catalogue enrichment artifact.
-- See drizzle/AGENTS.md before applying. It is intentionally not journaled.

BEGIN;
--> statement-breakpoint
DO $$
BEGIN
	IF to_regclass('public.product_category') IS NULL
		OR to_regclass('public.product') IS NULL
		OR to_regclass('public.product_image') IS NULL
		OR to_regclass('public.file') IS NULL
		OR to_regclass('public.content_page') IS NULL THEN
		RAISE EXCEPTION 'Catalogue enrichment requires product, category, media, file, and content tables';
	END IF;

	IF to_regclass('public.product_catalog_profile') IS NOT NULL
		OR to_regclass('public.product_category_assignment') IS NOT NULL
		OR to_regclass('public.catalog_tag') IS NOT NULL
		OR to_regclass('public.product_tag') IS NOT NULL
		OR to_regclass('public.catalog_manufacturer') IS NOT NULL
		OR to_regclass('public.product_manufacturer') IS NOT NULL
		OR to_regclass('public.catalog_content_area') IS NOT NULL
		OR to_regclass('public.product_content_area') IS NOT NULL
		OR to_regclass('public.catalog_attribute') IS NOT NULL
		OR to_regclass('public.catalog_attribute_option') IS NOT NULL
		OR to_regclass('public.product_attribute_value') IS NOT NULL
		OR to_regclass('public.content_tag') IS NOT NULL
		OR to_regclass('public.content_page_area') IS NOT NULL
		OR to_regclass('public.product_content_link') IS NOT NULL
		OR to_regclass('public.catalog_media_asset') IS NOT NULL
		OR to_regclass('public.product_media_assignment') IS NOT NULL
		OR to_regclass('public.catalog_enrichment_run') IS NOT NULL THEN
		RAISE EXCEPTION 'A catalogue enrichment relation already exists; stop and inspect the target-specific shape';
	END IF;

	IF EXISTS (SELECT 1 FROM product WHERE tags IS NOT NULL AND NOT pg_input_is_valid(tags, 'jsonb'))
		OR EXISTS (SELECT 1 FROM content_page WHERE tags IS NOT NULL AND NOT pg_input_is_valid(tags, 'jsonb')) THEN
		RAISE EXCEPTION 'Legacy catalogue/content tags contain invalid JSON';
	END IF;

	IF EXISTS (SELECT 1 FROM product WHERE tags IS NOT NULL AND jsonb_typeof(tags::jsonb) <> 'array')
		OR EXISTS (SELECT 1 FROM content_page WHERE tags IS NOT NULL AND jsonb_typeof(tags::jsonb) <> 'array') THEN
		RAISE EXCEPTION 'Legacy catalogue/content tags must be JSON arrays';
	END IF;

	IF EXISTS (
		SELECT 1 FROM product_image WHERE is_main GROUP BY product_id HAVING count(*) > 1
	) THEN
		RAISE EXCEPTION 'A product has multiple main images';
	END IF;

	IF EXISTS (
		SELECT 1 FROM product_image AS image LEFT JOIN file ON file.id = image.file_id WHERE file.id IS NULL
	) THEN
		RAISE EXCEPTION 'A product image references a missing file';
	END IF;

	IF EXISTS (
		WITH RECURSIVE walk AS (
			SELECT id, parent_id, ARRAY[id] AS path, false AS cycle FROM product_category
			UNION ALL
			SELECT parent.id, parent.parent_id, walk.path || parent.id, parent.id = ANY(walk.path)
			FROM walk
			INNER JOIN product_category AS parent ON parent.id = walk.parent_id
			WHERE NOT walk.cycle
		)
		SELECT 1 FROM walk WHERE cycle
	) THEN
		RAISE EXCEPTION 'Product category hierarchy contains a cycle';
	END IF;
END $$;
--> statement-breakpoint
CREATE TABLE "product_catalog_profile" (
	"product_id" integer PRIMARY KEY NOT NULL REFERENCES "public"."product"("id") ON DELETE CASCADE,
	"data_class" text DEFAULT 'research' NOT NULL,
	"disclosure" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_catalog_profile_data_class_check" CHECK ("data_class" IN ('verified', 'research', 'mock_test'))
);
--> statement-breakpoint
CREATE TABLE "product_category_assignment" (
	"product_id" integer NOT NULL REFERENCES "public"."product"("id") ON DELETE CASCADE,
	"category_id" integer NOT NULL REFERENCES "public"."product_category"("id") ON DELETE RESTRICT,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_category_assignment_product_id_category_id_pk" PRIMARY KEY("product_id", "category_id")
);
--> statement-breakpoint
CREATE INDEX "product_category_assignment_category_idx" ON "product_category_assignment" ("category_id", "product_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "product_category_assignment_primary_idx" ON "product_category_assignment" ("product_id") WHERE "is_primary";
--> statement-breakpoint
CREATE TABLE "catalog_tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"description" text,
	"is_filterable" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_tag_slug_lower_check" CHECK ("slug" = lower("slug"))
);
--> statement-breakpoint
CREATE INDEX "catalog_tag_active_idx" ON "catalog_tag" ("is_active", "name");
--> statement-breakpoint
CREATE TABLE "product_tag" (
	"product_id" integer NOT NULL REFERENCES "public"."product"("id") ON DELETE CASCADE,
	"tag_id" integer NOT NULL REFERENCES "public"."catalog_tag"("id") ON DELETE RESTRICT,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_tag_product_id_tag_id_pk" PRIMARY KEY("product_id", "tag_id")
);
--> statement-breakpoint
CREATE INDEX "product_tag_tag_idx" ON "product_tag" ("tag_id", "product_id");
--> statement-breakpoint
CREATE TABLE "catalog_manufacturer" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"description" text,
	"website_url" text,
	"verification_status" text DEFAULT 'unverified' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_manufacturer_slug_lower_check" CHECK ("slug" = lower("slug")),
	CONSTRAINT "catalog_manufacturer_status_check" CHECK ("verification_status" IN ('unverified', 'verified', 'retired'))
);
--> statement-breakpoint
CREATE INDEX "catalog_manufacturer_status_idx" ON "catalog_manufacturer" ("verification_status");
--> statement-breakpoint
CREATE TABLE "product_manufacturer" (
	"product_id" integer NOT NULL REFERENCES "public"."product"("id") ON DELETE CASCADE,
	"manufacturer_id" integer NOT NULL REFERENCES "public"."catalog_manufacturer"("id") ON DELETE RESTRICT,
	"relationship" text DEFAULT 'manufacturer' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_manufacturer_product_id_manufacturer_id_relationship_pk" PRIMARY KEY("product_id", "manufacturer_id", "relationship"),
	CONSTRAINT "product_manufacturer_relationship_check" CHECK ("relationship" IN ('manufacturer', 'brand', 'designer'))
);
--> statement-breakpoint
CREATE INDEX "product_manufacturer_manufacturer_idx" ON "product_manufacturer" ("manufacturer_id", "product_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "product_manufacturer_primary_idx" ON "product_manufacturer" ("product_id") WHERE "is_primary";
--> statement-breakpoint
CREATE TABLE "catalog_content_area" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_content_area_slug_lower_check" CHECK ("slug" = lower("slug"))
);
--> statement-breakpoint
CREATE INDEX "catalog_content_area_active_idx" ON "catalog_content_area" ("is_active", "sort_order");
--> statement-breakpoint
CREATE TABLE "product_content_area" (
	"product_id" integer NOT NULL REFERENCES "public"."product"("id") ON DELETE CASCADE,
	"content_area_id" integer NOT NULL REFERENCES "public"."catalog_content_area"("id") ON DELETE RESTRICT,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_content_area_product_id_content_area_id_pk" PRIMARY KEY("product_id", "content_area_id")
);
--> statement-breakpoint
CREATE INDEX "product_content_area_area_idx" ON "product_content_area" ("content_area_id", "product_id");
--> statement-breakpoint
CREATE TABLE "catalog_attribute" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"description" text,
	"value_type" text NOT NULL,
	"unit" text,
	"is_filterable" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_attribute_slug_lower_check" CHECK ("slug" = lower("slug")),
	CONSTRAINT "catalog_attribute_value_type_check" CHECK ("value_type" IN ('option', 'text', 'number', 'boolean'))
);
--> statement-breakpoint
CREATE INDEX "catalog_attribute_filter_idx" ON "catalog_attribute" ("is_filterable", "sort_order");
--> statement-breakpoint
CREATE TABLE "catalog_attribute_option" (
	"id" serial PRIMARY KEY NOT NULL,
	"attribute_id" integer NOT NULL REFERENCES "public"."catalog_attribute"("id") ON DELETE CASCADE,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "catalog_attribute_option_slug_lower_check" CHECK ("slug" = lower("slug"))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_attribute_option_slug_idx" ON "catalog_attribute_option" ("attribute_id", "slug");
--> statement-breakpoint
CREATE TABLE "product_attribute_value" (
	"product_id" integer NOT NULL REFERENCES "public"."product"("id") ON DELETE CASCADE,
	"attribute_id" integer NOT NULL REFERENCES "public"."catalog_attribute"("id") ON DELETE RESTRICT,
	"option_id" integer REFERENCES "public"."catalog_attribute_option"("id") ON DELETE RESTRICT,
	"text_value" text,
	"number_value" numeric(14,4),
	"boolean_value" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_attribute_value_product_id_attribute_id_pk" PRIMARY KEY("product_id", "attribute_id"),
	CONSTRAINT "product_attribute_value_exactly_one_check" CHECK (num_nonnulls("option_id", "text_value", "number_value", "boolean_value") = 1)
);
--> statement-breakpoint
CREATE INDEX "product_attribute_value_attribute_idx" ON "product_attribute_value" ("attribute_id", "option_id", "product_id");
--> statement-breakpoint
CREATE TABLE "content_tag" (
	"content_page_id" integer NOT NULL REFERENCES "public"."content_page"("id") ON DELETE CASCADE,
	"tag_id" integer NOT NULL REFERENCES "public"."catalog_tag"("id") ON DELETE RESTRICT,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_tag_content_page_id_tag_id_pk" PRIMARY KEY("content_page_id", "tag_id")
);
--> statement-breakpoint
CREATE INDEX "content_tag_tag_idx" ON "content_tag" ("tag_id", "content_page_id");
--> statement-breakpoint
CREATE TABLE "content_page_area" (
	"content_page_id" integer NOT NULL REFERENCES "public"."content_page"("id") ON DELETE CASCADE,
	"content_area_id" integer NOT NULL REFERENCES "public"."catalog_content_area"("id") ON DELETE RESTRICT,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_page_area_content_page_id_content_area_id_pk" PRIMARY KEY("content_page_id", "content_area_id")
);
--> statement-breakpoint
CREATE INDEX "content_page_area_area_idx" ON "content_page_area" ("content_area_id", "content_page_id");
--> statement-breakpoint
CREATE TABLE "product_content_link" (
	"product_id" integer NOT NULL REFERENCES "public"."product"("id") ON DELETE CASCADE,
	"content_page_id" integer NOT NULL REFERENCES "public"."content_page"("id") ON DELETE CASCADE,
	"relationship" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_content_link_product_id_content_page_id_relationship_pk" PRIMARY KEY("product_id", "content_page_id", "relationship"),
	CONSTRAINT "product_content_link_relationship_check" CHECK ("relationship" IN ('guide', 'faq', 'recommended', 'required', 'mentioned'))
);
--> statement-breakpoint
CREATE INDEX "product_content_link_content_idx" ON "product_content_link" ("content_page_id", "product_id");
--> statement-breakpoint
CREATE TABLE "catalog_media_asset" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL UNIQUE REFERENCES "public"."file"("id") ON DELETE RESTRICT,
	"kind" text DEFAULT 'image' NOT NULL,
	"data_class" text DEFAULT 'research' NOT NULL,
	"rights_status" text DEFAULT 'unverified' NOT NULL,
	"provenance_note" text,
	"verified_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_media_asset_kind_check" CHECK ("kind" IN ('image', 'diagram', 'document', 'video')),
	CONSTRAINT "catalog_media_asset_data_class_check" CHECK ("data_class" IN ('verified', 'research', 'mock_test')),
	CONSTRAINT "catalog_media_asset_rights_status_check" CHECK ("rights_status" IN ('unverified', 'approved', 'restricted', 'expired'))
);
--> statement-breakpoint
CREATE INDEX "catalog_media_asset_publication_idx" ON "catalog_media_asset" ("data_class", "rights_status");
--> statement-breakpoint
CREATE TABLE "product_media_assignment" (
	"product_id" integer NOT NULL REFERENCES "public"."product"("id") ON DELETE CASCADE,
	"media_asset_id" integer NOT NULL REFERENCES "public"."catalog_media_asset"("id") ON DELETE RESTRICT,
	"role" text NOT NULL,
	"alt_text" text,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_media_assignment_product_id_media_asset_id_role_pk" PRIMARY KEY("product_id", "media_asset_id", "role"),
	CONSTRAINT "product_media_assignment_role_check" CHECK ("role" IN ('primary', 'gallery', 'diagram', 'manual'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "product_media_assignment_primary_idx" ON "product_media_assignment" ("product_id") WHERE "role" = 'primary';
--> statement-breakpoint
CREATE INDEX "product_media_assignment_media_idx" ON "product_media_assignment" ("media_asset_id", "product_id");
--> statement-breakpoint
CREATE TABLE "catalog_enrichment_run" (
	"run_id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"status" text NOT NULL,
	"release_id" text NOT NULL,
	"source_commit" text NOT NULL,
	"migration_hash" text NOT NULL,
	"seed_hash" text NOT NULL,
	"backup_evidence" text NOT NULL,
	"summary" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "catalog_enrichment_run_action_check" CHECK ("action" = 'apply'),
	CONSTRAINT "catalog_enrichment_run_status_check" CHECK ("status" IN ('running', 'applied', 'failed')),
	CONSTRAINT "catalog_enrichment_run_migration_hash_check" CHECK ("migration_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "catalog_enrichment_run_seed_hash_check" CHECK ("seed_hash" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE INDEX "catalog_enrichment_run_created_idx" ON "catalog_enrichment_run" ("created_at");
--> statement-breakpoint
COMMIT;
