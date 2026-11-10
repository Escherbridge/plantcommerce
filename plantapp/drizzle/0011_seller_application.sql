-- Additive seller-application table. No changes to existing rows.
-- Applied on server startup by ensureAdditiveMigrations(). Not journaled.
-- See drizzle/AGENTS.md.

BEGIN;

CREATE TABLE IF NOT EXISTS "public"."seller_application" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"business_name" text NOT NULL,
	"website_or_social" text,
	"offerings" text NOT NULL,
	"location" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "seller_application_email_idx" ON "public"."seller_application" USING btree ("email");
CREATE INDEX IF NOT EXISTS "seller_application_created_at_idx" ON "public"."seller_application" USING btree ("created_at");

COMMIT;
