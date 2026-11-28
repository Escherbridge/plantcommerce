-- Additive manager-invite tables, and the application role list now includes seller.
-- user.role is unconstrained text. This file does not ALTER "user" and does not
-- rewrite existing rows. seller is accepted by the application enum only.
-- token_hash is the public lookup key. token is retained so staff can copy the
-- link later. Neither column is a payout, rate, or commission field.
-- Applied on server startup by ensureAdditiveMigrations(). Not journaled.
-- See drizzle/AGENTS.md.

BEGIN;

CREATE TABLE IF NOT EXISTS "public"."manager_invite" (
	"id" text PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"token" text NOT NULL,
	"role" text NOT NULL,
	"label" text,
	"expires_at" timestamp with time zone,
	"use_limit" integer,
	"note" text,
	"status" text DEFAULT 'active' NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "manager_invite_role_check" CHECK ("role" IN ('affiliate', 'seller', 'instructor')),
	CONSTRAINT "manager_invite_status_check" CHECK ("status" IN ('active', 'revoked')),
	CONSTRAINT "manager_invite_use_limit_check" CHECK ("use_limit" IS NULL OR "use_limit" >= 1),
	CONSTRAINT "manager_invite_created_by_user_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "manager_invite_token_hash_idx" ON "public"."manager_invite" USING btree ("token_hash");
CREATE UNIQUE INDEX IF NOT EXISTS "manager_invite_token_idx" ON "public"."manager_invite" USING btree ("token");
CREATE INDEX IF NOT EXISTS "manager_invite_created_by_idx" ON "public"."manager_invite" USING btree ("created_by");

CREATE TABLE IF NOT EXISTS "public"."manager_invite_use" (
	"id" text PRIMARY KEY NOT NULL,
	"invite_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"role_removed_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "manager_invite_use_status_check" CHECK ("status" IN ('pending', 'approved', 'declined')),
	CONSTRAINT "manager_invite_use_invite_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."manager_invite"("id"),
	CONSTRAINT "manager_invite_use_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id"),
	CONSTRAINT "manager_invite_use_reviewer_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "manager_invite_use_invite_user_idx" ON "public"."manager_invite_use" USING btree ("invite_id", "user_id");
CREATE INDEX IF NOT EXISTS "manager_invite_use_invite_idx" ON "public"."manager_invite_use" USING btree ("invite_id");
CREATE INDEX IF NOT EXISTS "manager_invite_use_user_idx" ON "public"."manager_invite_use" USING btree ("user_id");

COMMIT;
