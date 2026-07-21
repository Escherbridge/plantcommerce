-- Source-only recovery migration. See drizzle/AGENTS.md before applying this to any database.
-- It is intentionally not journaled while the historical Drizzle baseline is unresolved.

BEGIN;
--> statement-breakpoint
DO $$
BEGIN
	IF to_regclass('public.user') IS NULL
		OR to_regclass('public.email_verification_token') IS NULL
		OR to_regclass('public.login_attempts') IS NULL THEN
		RAISE EXCEPTION 'The auth capability migration requires user, email_verification_token, and login_attempts tables';
	END IF;

	IF to_regclass('public.password_reset_token') IS NOT NULL THEN
		RAISE EXCEPTION 'password_reset_token already exists; stop and reconcile the target-specific baseline';
	END IF;

	IF to_regclass('public.email_change_capability') IS NOT NULL THEN
		RAISE EXCEPTION 'email_change_capability already exists; stop and reconcile the target-specific baseline';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "public"."user"
		GROUP BY lower(btrim(email))
		HAVING count(*) > 1
	) THEN
		RAISE EXCEPTION 'Case-insensitive email collisions exist; reconcile them before normalizing email identity';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "public"."user" AS username_owner
		INNER JOIN "public"."user" AS email_owner
			ON lower(btrim(username_owner.username)) = lower(btrim(email_owner.email))
			AND username_owner.id <> email_owner.id
	) THEN
		RAISE EXCEPTION 'Username/email identifier collisions exist; reconcile them before enabling deterministic login lookup';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "public"."user"
		WHERE username ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
	) THEN
		RAISE EXCEPTION 'Email-shaped usernames exist; rename or explicitly remediate them before enabling deterministic login lookup';
	END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "public"."user" ADD COLUMN IF NOT EXISTS "pending_email" text;
--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "public"."user"
		WHERE pending_email IS NOT NULL
		GROUP BY lower(btrim(pending_email))
		HAVING count(*) > 1
	) THEN
		RAISE EXCEPTION 'Case-insensitive pending-email collisions exist; reconcile them before normalizing email identity';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "public"."user" AS active_owner
		INNER JOIN "public"."user" AS pending_owner
			ON lower(btrim(active_owner.email)) = lower(btrim(pending_owner.pending_email))
			AND active_owner.id <> pending_owner.id
	) THEN
		RAISE EXCEPTION 'Active/pending email collisions exist; reconcile them before normalizing email identity';
	END IF;
END $$;
--> statement-breakpoint
UPDATE "public"."user"
SET email = lower(btrim(email)),
	pending_email = CASE
		WHEN pending_email IS NULL THEN NULL
		ELSE lower(btrim(pending_email))
	END;
--> statement-breakpoint
CREATE UNIQUE INDEX "user_pending_email_unique" ON "public"."user" USING btree ("pending_email");
--> statement-breakpoint
-- Legacy verification IDs were bearer secrets. Purge rather than preserve raw-token rows.
DELETE FROM "public"."email_verification_token";
--> statement-breakpoint
CREATE UNIQUE INDEX "email_verification_token_user_idx" ON "public"."email_verification_token" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "email_verification_token_expires_idx" ON "public"."email_verification_token" USING btree ("expires_at");
--> statement-breakpoint
CREATE TABLE "public"."email_change_capability" (
	"user_id" text PRIMARY KEY NOT NULL REFERENCES "public"."user"("id"),
	"previous_email" text NOT NULL,
	"pending_email" text NOT NULL,
	"new_email_token_hash" text,
	"previous_email_token_hash" text,
	"new_email_proved_at" timestamp with time zone,
	"previous_email_confirmed_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_change_capability_distinct_addresses" CHECK ("previous_email" <> "pending_email"),
	CONSTRAINT "email_change_capability_new_proof" CHECK ("new_email_token_hash" IS NOT NULL OR "new_email_proved_at" IS NOT NULL),
	CONSTRAINT "email_change_capability_previous_proof" CHECK ("previous_email_token_hash" IS NOT NULL OR "previous_email_confirmed_at" IS NOT NULL)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "email_change_capability_new_token_idx" ON "public"."email_change_capability" USING btree ("new_email_token_hash");
--> statement-breakpoint
CREATE UNIQUE INDEX "email_change_capability_previous_token_idx" ON "public"."email_change_capability" USING btree ("previous_email_token_hash");
--> statement-breakpoint
CREATE INDEX "email_change_capability_expires_idx" ON "public"."email_change_capability" USING btree ("expires_at");
--> statement-breakpoint
-- Merge legacy duplicate throttle rows before making the subject record unique.
WITH summaries AS (
	SELECT identifier,
		identifier_type,
		MAX(id) AS keeper_id,
		LEAST(2147483647, SUM(attempts))::integer AS attempts,
		MAX(last_attempt) AS last_attempt,
		MAX(blocked_until) AS blocked_until
	FROM "public"."login_attempts"
	GROUP BY identifier, identifier_type
)
UPDATE "public"."login_attempts" AS attempt
SET attempts = summaries.attempts,
	last_attempt = summaries.last_attempt,
	blocked_until = summaries.blocked_until
FROM summaries
WHERE attempt.id = summaries.keeper_id;
--> statement-breakpoint
DELETE FROM "public"."login_attempts"
WHERE id NOT IN (
	SELECT MAX(id)
	FROM "public"."login_attempts"
	GROUP BY identifier, identifier_type
);
--> statement-breakpoint
DROP INDEX IF EXISTS "public"."login_attempts_identifier_idx";
--> statement-breakpoint
CREATE UNIQUE INDEX "login_attempts_identifier_idx" ON "public"."login_attempts" USING btree ("identifier", "identifier_type");
--> statement-breakpoint
CREATE TABLE "public"."password_reset_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "public"."user"("id"),
	"email" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_token_user_idx" ON "public"."password_reset_token" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "password_reset_token_expires_idx" ON "public"."password_reset_token" USING btree ("expires_at");
--> statement-breakpoint
COMMIT;
