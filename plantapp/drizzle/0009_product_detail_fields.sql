-- Source-only additive product-detail migration. See drizzle/AGENTS.md before applying this to any database.
-- It is intentionally not journaled while the historical Drizzle baseline is unresolved.
-- Additive only: ADD COLUMN / CREATE TABLE / CREATE INDEX, all IF NOT EXISTS. No DROP, no data mutation.
-- Adds the Aevani product-page fields (design-spec §5) to "product" and the "product_review" table.

BEGIN;
--> statement-breakpoint
DO $$
BEGIN
	IF to_regclass('public.product') IS NULL THEN
		RAISE EXCEPTION 'The product-detail migration requires the product table; stop and reconcile the target baseline';
	END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "description_html" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "key_features" jsonb;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "stats" jsonb;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "specs" jsonb;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "in_the_box" jsonb;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "faqs" jsonb;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "badges" jsonb;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "test_bed_note" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "warranty" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "shipping_note" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "bundle_offer" jsonb;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "related_product_ids" jsonb;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "currency" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "rating_average" numeric(3, 2);--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "review_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_review" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"author_name" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"is_verified_purchase" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_review_rating_range_check" CHECK ("product_review"."rating" between 1 and 5),
	CONSTRAINT "product_review_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_review_product_idx" ON "product_review" USING btree ("product_id");--> statement-breakpoint
COMMIT;
