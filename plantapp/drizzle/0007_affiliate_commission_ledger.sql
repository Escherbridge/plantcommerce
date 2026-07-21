-- Source-only affiliate ownership, cart identity, and immutable commission-ledger recovery migration.
-- See drizzle/AGENTS.md before applying. It is intentionally not journaled.

BEGIN;
--> statement-breakpoint
DO $$
BEGIN
	IF to_regclass('public.affiliate') IS NULL
		OR to_regclass('public.affiliate_link') IS NULL
		OR to_regclass('public.cart') IS NULL
		OR to_regclass('public.checkout_draft') IS NULL
		OR to_regclass('public.order') IS NULL
		OR to_regclass('public.stripe_webhook_event') IS NULL THEN
		RAISE EXCEPTION 'The affiliate commission ledger migration requires affiliate, affiliate_link, cart, checkout_draft, order, and stripe_webhook_event tables';
	END IF;

	IF to_regclass('public.affiliate_tier') IS NOT NULL
		OR to_regclass('public.affiliate_terms_acceptance') IS NOT NULL
		OR to_regclass('public.affiliate_payout') IS NOT NULL
		OR to_regclass('public.affiliate_commission_ledger') IS NOT NULL
		OR to_regclass('public.affiliate_commission_ledger_event') IS NOT NULL THEN
		RAISE EXCEPTION 'An affiliate commission-ledger table already exists; stop and reconcile the target-specific baseline';
	END IF;

	IF to_regclass('public.cart_user_id_unique') IS NOT NULL
		OR to_regclass('public.cart_session_id_unique') IS NOT NULL
		OR EXISTS (
			SELECT 1 FROM pg_constraint
			WHERE conrelid = 'public.cart'::regclass AND conname = 'cart_identity_check'
		) THEN
		RAISE EXCEPTION 'A canonical cart identity object already exists; stop and reconcile the target-specific baseline';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'checkout_draft'
			AND column_name IN (
				'affiliate_id',
				'affiliate_commission_rate_bps',
				'affiliate_tier_code',
				'affiliate_tier_version',
				'affiliate_terms_version',
				'affiliate_disclosure_version',
				'affiliate_terms_acceptance_id'
			)
	) OR EXISTS (
		SELECT 1 FROM pg_trigger
		WHERE tgrelid = 'public.checkout_draft'::regclass
			AND tgname = 'checkout_draft_affiliate_policy_immutable'
	) THEN
		RAISE EXCEPTION 'An affiliate policy snapshot object already exists on checkout_draft; stop and reconcile the target-specific baseline';
	END IF;
	IF NOT EXISTS (
		SELECT 1 FROM pg_trigger
		WHERE tgrelid = 'public.checkout_draft'::regclass
			AND tgname = 'checkout_draft_snapshot_immutable'
	) THEN
		RAISE EXCEPTION 'The secure checkout immutable-draft trigger is missing; apply and reconcile the 0003 recovery artifact first';
	END IF;

	IF EXISTS (SELECT 1 FROM affiliate GROUP BY user_id HAVING count(*) > 1) THEN
		RAISE EXCEPTION 'affiliate.user_id contains duplicates; reconcile ownership before adding the unique invariant';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM pg_constraint con
		INNER JOIN pg_class idx ON idx.oid = con.conindid
		WHERE idx.relnamespace = 'public'::regnamespace
			AND idx.relname = 'affiliate_user_idx'
	) THEN
		RAISE EXCEPTION 'affiliate_user_idx backs a constraint and must be reconciled manually before this recovery migration can replace it';
	END IF;
	IF EXISTS (SELECT 1 FROM cart WHERE (user_id IS NULL) = (session_id IS NULL)) THEN
		RAISE EXCEPTION 'cart contains rows with no identity or both identities; reconcile before adding the identity check';
	END IF;
	IF EXISTS (SELECT 1 FROM cart WHERE user_id IS NOT NULL GROUP BY user_id HAVING count(*) > 1) THEN
		RAISE EXCEPTION 'cart.user_id contains duplicate canonical carts; reconcile before adding the unique invariant';
	END IF;
	IF EXISTS (SELECT 1 FROM cart WHERE session_id IS NOT NULL GROUP BY session_id HAVING count(*) > 1) THEN
		RAISE EXCEPTION 'cart.session_id contains duplicate canonical carts; reconcile before adding the unique invariant';
	END IF;
	IF EXISTS (
		SELECT 1 FROM checkout_draft
		WHERE affiliate_link_id IS NOT NULL
			AND status IN ('pending_session', 'checkout_created', 'quarantined', 'paid')
	) THEN
		RAISE EXCEPTION 'Active attributed checkout drafts must be expired or fulfilled before establishing immutable affiliate policy snapshots';
	END IF;
	IF EXISTS (SELECT 1 FROM affiliate WHERE commission_rate < 0 OR commission_rate > 1) THEN
		RAISE EXCEPTION 'affiliate.commission_rate must be between zero and one before it can be captured as basis points';
	END IF;
END $$;
--> statement-breakpoint
DROP INDEX IF EXISTS "public"."affiliate_user_idx";
--> statement-breakpoint
CREATE UNIQUE INDEX "affiliate_user_idx" ON "affiliate" USING btree ("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "cart_user_id_unique" ON "cart" USING btree ("user_id") WHERE "user_id" IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "cart_session_id_unique" ON "cart" USING btree ("session_id") WHERE "session_id" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_identity_check" CHECK (("user_id" IS NULL) <> ("session_id" IS NULL));
--> statement-breakpoint
CREATE TABLE "affiliate_tier" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"version" integer NOT NULL,
	"commission_rate_bps" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_tier_version_check" CHECK ("version" >= 0),
	CONSTRAINT "affiliate_tier_rate_bps_check" CHECK ("commission_rate_bps" >= 0 AND "commission_rate_bps" <= 10000)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "affiliate_tier_code_version_idx" ON "affiliate_tier" USING btree ("code", "version");
--> statement-breakpoint
CREATE INDEX "affiliate_tier_active_idx" ON "affiliate_tier" USING btree ("is_active");
--> statement-breakpoint
CREATE TABLE "affiliate_terms_acceptance" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" integer NOT NULL REFERENCES "public"."affiliate"("id") ON DELETE RESTRICT,
	"terms_version" text NOT NULL,
	"disclosure_version" text NOT NULL,
	"acceptance_reference" text NOT NULL,
	"accepted_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "affiliate_terms_acceptance_reference_idx" ON "affiliate_terms_acceptance" USING btree ("acceptance_reference");
--> statement-breakpoint
CREATE UNIQUE INDEX "affiliate_terms_acceptance_version_idx" ON "affiliate_terms_acceptance" USING btree ("affiliate_id", "terms_version", "disclosure_version");
--> statement-breakpoint
CREATE INDEX "affiliate_terms_acceptance_affiliate_accepted_idx" ON "affiliate_terms_acceptance" USING btree ("affiliate_id", "accepted_at");
--> statement-breakpoint
ALTER TABLE "checkout_draft"
	ADD COLUMN "affiliate_id" integer REFERENCES "public"."affiliate"("id"),
	ADD COLUMN "affiliate_commission_rate_bps" integer,
	ADD COLUMN "affiliate_tier_code" text DEFAULT 'legacy-rate' NOT NULL,
	ADD COLUMN "affiliate_tier_version" integer DEFAULT 0 NOT NULL,
	ADD COLUMN "affiliate_terms_version" text DEFAULT 'unrecorded' NOT NULL,
	ADD COLUMN "affiliate_disclosure_version" text DEFAULT 'unrecorded' NOT NULL,
	ADD COLUMN "affiliate_terms_acceptance_id" text REFERENCES "public"."affiliate_terms_acceptance"("id");
--> statement-breakpoint
UPDATE "checkout_draft" AS draft
SET "affiliate_id" = link."affiliate_id",
	"affiliate_commission_rate_bps" = ROUND(affiliate."commission_rate" * 10000)::integer
FROM "affiliate_link" AS link
INNER JOIN "affiliate" AS affiliate ON affiliate."id" = link."affiliate_id"
WHERE draft."affiliate_link_id" = link."id";
--> statement-breakpoint
ALTER TABLE "checkout_draft"
	ADD CONSTRAINT "checkout_draft_affiliate_policy_pair_check"
		CHECK (("affiliate_id" IS NULL) = ("affiliate_commission_rate_bps" IS NULL)),
	ADD CONSTRAINT "checkout_draft_affiliate_rate_bps_check"
		CHECK ("affiliate_commission_rate_bps" IS NULL OR ("affiliate_commission_rate_bps" >= 0 AND "affiliate_commission_rate_bps" <= 10000)),
	ADD CONSTRAINT "checkout_draft_affiliate_tier_version_check"
		CHECK ("affiliate_tier_version" >= 0);
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "guard_checkout_draft_affiliate_policy_snapshot"() RETURNS trigger AS $$
DECLARE
	linked_affiliate_id integer;
	acceptance_affiliate_id integer;
BEGIN
	IF TG_OP = 'UPDATE' THEN
		IF NEW.affiliate_id IS DISTINCT FROM OLD.affiliate_id
			OR NEW.affiliate_commission_rate_bps IS DISTINCT FROM OLD.affiliate_commission_rate_bps
			OR NEW.affiliate_tier_code IS DISTINCT FROM OLD.affiliate_tier_code
			OR NEW.affiliate_tier_version IS DISTINCT FROM OLD.affiliate_tier_version
			OR NEW.affiliate_terms_version IS DISTINCT FROM OLD.affiliate_terms_version
			OR NEW.affiliate_disclosure_version IS DISTINCT FROM OLD.affiliate_disclosure_version
			OR NEW.affiliate_terms_acceptance_id IS DISTINCT FROM OLD.affiliate_terms_acceptance_id THEN
			RAISE EXCEPTION 'checkout draft affiliate policy snapshot fields are immutable';
		END IF;
	END IF;

	IF NEW.affiliate_link_id IS NOT NULL AND NEW.affiliate_id IS NOT NULL THEN
		SELECT affiliate_id INTO linked_affiliate_id FROM affiliate_link WHERE id = NEW.affiliate_link_id;
		IF linked_affiliate_id IS NULL OR linked_affiliate_id IS DISTINCT FROM NEW.affiliate_id THEN
			RAISE EXCEPTION 'checkout draft affiliate snapshot does not match its affiliate link';
		END IF;
	END IF;

	IF NEW.affiliate_terms_acceptance_id IS NOT NULL THEN
		SELECT affiliate_id INTO acceptance_affiliate_id FROM affiliate_terms_acceptance WHERE id = NEW.affiliate_terms_acceptance_id;
		IF acceptance_affiliate_id IS NULL OR NEW.affiliate_id IS NULL OR acceptance_affiliate_id IS DISTINCT FROM NEW.affiliate_id THEN
			RAISE EXCEPTION 'checkout draft terms acceptance does not match its affiliate snapshot';
		END IF;
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER "checkout_draft_affiliate_policy_immutable"
	BEFORE INSERT OR UPDATE ON "checkout_draft"
	FOR EACH ROW EXECUTE FUNCTION "guard_checkout_draft_affiliate_policy_snapshot"();
--> statement-breakpoint
CREATE TABLE "affiliate_payout" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" integer NOT NULL REFERENCES "public"."affiliate"("id") ON DELETE RESTRICT,
	"payout_reference" text NOT NULL,
	"currency" varchar(3) NOT NULL,
	"amount_minor" bigint NOT NULL,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_payout_amount_check" CHECK ("amount_minor" > 0 AND "amount_minor" <= 9007199254740991),
	CONSTRAINT "affiliate_payout_currency_check" CHECK ("currency" ~ '^[a-z]{3}$'),
	CONSTRAINT "affiliate_payout_period_check" CHECK ("period_start" IS NULL OR "period_end" IS NULL OR "period_start" <= "period_end")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "affiliate_payout_reference_idx" ON "affiliate_payout" USING btree ("payout_reference");
--> statement-breakpoint
CREATE INDEX "affiliate_payout_affiliate_created_idx" ON "affiliate_payout" USING btree ("affiliate_id", "created_at");
--> statement-breakpoint
CREATE TABLE "affiliate_commission_ledger" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" integer NOT NULL REFERENCES "public"."affiliate"("id") ON DELETE RESTRICT,
	"affiliate_link_id" integer NOT NULL REFERENCES "public"."affiliate_link"("id") ON DELETE RESTRICT,
	"source_order_id" integer NOT NULL REFERENCES "public"."order"("id") ON DELETE RESTRICT,
	"source_checkout_draft_id" text NOT NULL REFERENCES "public"."checkout_draft"("id") ON DELETE RESTRICT,
	"source_stripe_webhook_event_id" text NOT NULL REFERENCES "public"."stripe_webhook_event"("id") ON DELETE RESTRICT,
	"source_reference" text NOT NULL,
	"currency" varchar(3) NOT NULL,
	"quoted_amount_minor" bigint NOT NULL,
	"commission_rate_bps" integer NOT NULL,
	"draft_snapshot_hash" text NOT NULL,
	"tier_code" text NOT NULL,
	"tier_version" integer NOT NULL,
	"terms_version" text NOT NULL,
	"disclosure_version" text NOT NULL,
	"terms_acceptance_id" text REFERENCES "public"."affiliate_terms_acceptance"("id") ON DELETE RESTRICT,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_commission_ledger_amount_check" CHECK ("quoted_amount_minor" > 0 AND "quoted_amount_minor" <= 9007199254740991),
	CONSTRAINT "affiliate_commission_ledger_rate_bps_check" CHECK ("commission_rate_bps" >= 0 AND "commission_rate_bps" <= 10000),
	CONSTRAINT "affiliate_commission_ledger_currency_check" CHECK ("currency" ~ '^[a-z]{3}$'),
	CONSTRAINT "affiliate_commission_ledger_tier_version_check" CHECK ("tier_version" >= 0),
	CONSTRAINT "affiliate_commission_ledger_snapshot_hash_check" CHECK ("draft_snapshot_hash" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE UNIQUE INDEX "affiliate_commission_ledger_source_order_idx" ON "affiliate_commission_ledger" USING btree ("source_order_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "affiliate_commission_ledger_source_draft_idx" ON "affiliate_commission_ledger" USING btree ("source_checkout_draft_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "affiliate_commission_ledger_source_reference_idx" ON "affiliate_commission_ledger" USING btree ("source_reference");
--> statement-breakpoint
CREATE INDEX "affiliate_commission_ledger_affiliate_created_idx" ON "affiliate_commission_ledger" USING btree ("affiliate_id", "created_at");
--> statement-breakpoint
CREATE INDEX "affiliate_commission_ledger_link_created_idx" ON "affiliate_commission_ledger" USING btree ("affiliate_link_id", "created_at");
--> statement-breakpoint
CREATE TABLE "affiliate_commission_ledger_event" (
	"id" text PRIMARY KEY NOT NULL,
	"commission_id" text NOT NULL REFERENCES "public"."affiliate_commission_ledger"("id") ON DELETE RESTRICT,
	"event_type" text NOT NULL,
	"amount_delta_minor" bigint NOT NULL,
	"currency" varchar(3) NOT NULL,
	"payout_id" text REFERENCES "public"."affiliate_payout"("id") ON DELETE RESTRICT,
	"event_reference" text NOT NULL,
	"causation_reference" text,
	"reason_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_commission_ledger_event_amount_range_check" CHECK ("amount_delta_minor" >= -9007199254740991 AND "amount_delta_minor" <= 9007199254740991),
	CONSTRAINT "affiliate_commission_ledger_event_amount_shape_check" CHECK (("event_type" = 'pending' AND "amount_delta_minor" > 0) OR ("event_type" = 'reversed' AND "amount_delta_minor" < 0) OR ("event_type" IN ('approved', 'payable', 'paid') AND "amount_delta_minor" = 0)),
	CONSTRAINT "affiliate_commission_ledger_event_currency_check" CHECK ("currency" ~ '^[a-z]{3}$'),
	CONSTRAINT "affiliate_commission_ledger_event_payout_link_check" CHECK (("event_type" IN ('payable', 'paid')) = ("payout_id" IS NOT NULL)),
	CONSTRAINT "affiliate_commission_ledger_event_type_check" CHECK ("event_type" IN ('pending', 'approved', 'reversed', 'payable', 'paid')),
	CONSTRAINT "affiliate_commission_ledger_event_reason_check" CHECK ("reason_code" IN ('initial_accrual', 'refund', 'chargeback', 'manual_adjustment', 'payout'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "affiliate_commission_ledger_event_reference_idx" ON "affiliate_commission_ledger_event" USING btree ("event_reference");
--> statement-breakpoint
CREATE UNIQUE INDEX "affiliate_commission_ledger_event_single_lifecycle_idx" ON "affiliate_commission_ledger_event" USING btree ("commission_id", "event_type") WHERE "event_type" IN ('pending', 'approved', 'payable', 'paid');
--> statement-breakpoint
CREATE INDEX "affiliate_commission_ledger_event_commission_created_idx" ON "affiliate_commission_ledger_event" USING btree ("commission_id", "created_at");
--> statement-breakpoint
CREATE INDEX "affiliate_commission_ledger_event_payout_created_idx" ON "affiliate_commission_ledger_event" USING btree ("payout_id", "created_at");
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "prevent_affiliate_accounting_mutation"() RETURNS trigger AS $$
BEGIN
	IF TG_OP = 'DELETE' THEN
		RAISE EXCEPTION '% records cannot be deleted', TG_TABLE_NAME;
	END IF;
	RAISE EXCEPTION '% records are append-only and cannot be updated', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER "affiliate_terms_acceptance_immutable"
	BEFORE UPDATE OR DELETE ON "affiliate_terms_acceptance"
	FOR EACH ROW EXECUTE FUNCTION "prevent_affiliate_accounting_mutation"();
--> statement-breakpoint
CREATE TRIGGER "affiliate_payout_immutable"
	BEFORE UPDATE OR DELETE ON "affiliate_payout"
	FOR EACH ROW EXECUTE FUNCTION "prevent_affiliate_accounting_mutation"();
--> statement-breakpoint
CREATE TRIGGER "affiliate_commission_ledger_immutable"
	BEFORE UPDATE OR DELETE ON "affiliate_commission_ledger"
	FOR EACH ROW EXECUTE FUNCTION "prevent_affiliate_accounting_mutation"();
--> statement-breakpoint
CREATE TRIGGER "affiliate_commission_ledger_event_immutable"
	BEFORE UPDATE OR DELETE ON "affiliate_commission_ledger_event"
	FOR EACH ROW EXECUTE FUNCTION "prevent_affiliate_accounting_mutation"();
--> statement-breakpoint
COMMIT;
