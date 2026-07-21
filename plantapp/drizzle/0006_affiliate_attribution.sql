-- Source-only affiliate attribution recovery migration. See drizzle/AGENTS.md before applying.
-- It is intentionally not journaled while the historical Drizzle baseline is unresolved.

BEGIN;
--> statement-breakpoint
DO $$
BEGIN
	IF to_regclass('public.affiliate') IS NULL
		OR to_regclass('public.affiliate_link') IS NULL
		OR to_regclass('public.user') IS NULL THEN
		RAISE EXCEPTION 'The affiliate attribution migration requires affiliate, affiliate_link, and user tables';
	END IF;

	IF to_regclass('public.affiliate_attribution') IS NOT NULL
		OR to_regclass('public.affiliate_attribution_click') IS NOT NULL
		OR to_regclass('public.affiliate_click_dedupe') IS NOT NULL THEN
		RAISE EXCEPTION 'An affiliate attribution table already exists; stop and reconcile the target-specific baseline';
	END IF;
END $$;
--> statement-breakpoint
CREATE TABLE "affiliate_attribution" (
	"id" text PRIMARY KEY NOT NULL,
	"capability_hash" text NOT NULL,
	"affiliate_link_id" integer NOT NULL REFERENCES "public"."affiliate_link"("id") ON DELETE cascade,
	"client_hash" text NOT NULL,
	"user_id" text REFERENCES "public"."user"("id") ON DELETE SET NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "affiliate_attribution_capability_hash_idx" ON "affiliate_attribution" USING btree ("capability_hash");
--> statement-breakpoint
CREATE INDEX "affiliate_attribution_link_idx" ON "affiliate_attribution" USING btree ("affiliate_link_id");
--> statement-breakpoint
CREATE INDEX "affiliate_attribution_client_expires_idx" ON "affiliate_attribution" USING btree ("client_hash", "expires_at");
--> statement-breakpoint
CREATE INDEX "affiliate_attribution_expires_idx" ON "affiliate_attribution" USING btree ("expires_at");
--> statement-breakpoint
CREATE INDEX "affiliate_attribution_consumed_idx" ON "affiliate_attribution" USING btree ("consumed_at");
--> statement-breakpoint
CREATE TABLE "affiliate_attribution_click" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_attribution_id" text REFERENCES "public"."affiliate_attribution"("id") ON DELETE SET NULL,
	"affiliate_link_id" integer NOT NULL REFERENCES "public"."affiliate_link"("id") ON DELETE cascade,
	"client_hash" text NOT NULL,
	"user_id" text REFERENCES "public"."user"("id") ON DELETE SET NULL,
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "affiliate_attribution_click_link_date_idx" ON "affiliate_attribution_click" USING btree ("affiliate_link_id", "clicked_at");
--> statement-breakpoint
CREATE INDEX "affiliate_attribution_click_client_date_idx" ON "affiliate_attribution_click" USING btree ("client_hash", "clicked_at");
--> statement-breakpoint
CREATE INDEX "affiliate_attribution_click_attribution_idx" ON "affiliate_attribution_click" USING btree ("affiliate_attribution_id");
--> statement-breakpoint
CREATE TABLE "affiliate_click_dedupe" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_link_id" integer NOT NULL REFERENCES "public"."affiliate_link"("id") ON DELETE cascade,
	"client_hash" text NOT NULL,
	"last_clicked_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "affiliate_click_dedupe_link_client_idx" ON "affiliate_click_dedupe" USING btree ("affiliate_link_id", "client_hash");
--> statement-breakpoint
CREATE INDEX "affiliate_click_dedupe_last_clicked_idx" ON "affiliate_click_dedupe" USING btree ("last_clicked_at");
--> statement-breakpoint
COMMIT;
