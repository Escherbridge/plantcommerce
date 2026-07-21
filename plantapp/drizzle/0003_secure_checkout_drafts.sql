-- Source-only recovery migration. See drizzle/AGENTS.md before applying this to any database.
-- It is intentionally not journaled while the historical Drizzle baseline is unresolved.

BEGIN;
--> statement-breakpoint
DO $$
DECLARE
	preexisting_table text;
BEGIN
	SELECT c.relname
	INTO preexisting_table
	FROM pg_class c
	INNER JOIN pg_namespace n ON n.oid = c.relnamespace
	WHERE n.nspname = 'public'
		AND c.relkind IN ('r', 'p')
		AND c.relname = ANY (ARRAY[
			'checkout_draft',
			'checkout_draft_item',
			'checkout_inventory_reservation',
			'checkout_payment_attempt',
			'guest_order_access_grant',
			'stripe_webhook_event'
		])
	LIMIT 1;

	IF preexisting_table IS NOT NULL THEN
		RAISE EXCEPTION
			'USING 0003 against a database with existing % is unsafe; stop and reconcile the target-specific baseline',
			preexisting_table;
	END IF;
END $$;
--> statement-breakpoint
CREATE TABLE "checkout_draft" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"user_id" text,
	"guest_subject_hash" text,
	"source_cart_id" integer,
	"source_cart_updated_at" timestamp with time zone,
	"affiliate_link_id" integer,
	"affiliate_commission_minor" bigint DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending_session' NOT NULL,
	"currency" varchar(3) NOT NULL,
	"subtotal_minor" bigint NOT NULL,
	"tax_minor" bigint NOT NULL,
	"shipping_minor" bigint NOT NULL,
	"discount_minor" bigint NOT NULL,
	"total_minor" bigint NOT NULL,
	"snapshot_hash" text NOT NULL,
	"customer_email" text,
	"customer_phone" text,
	"shipping_address" text,
	"billing_address" text,
	"reservation_released_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "checkout_draft_reference_unique" UNIQUE("reference"),
	CONSTRAINT "checkout_draft_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id"),
	CONSTRAINT "checkout_draft_affiliate_link_id_affiliate_link_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "public"."affiliate_link"("id"),
	CONSTRAINT "checkout_draft_buyer_identity_check" CHECK (("user_id" IS NULL) <> ("guest_subject_hash" IS NULL)),
	CONSTRAINT "checkout_draft_guest_subject_hash_check" CHECK ("guest_subject_hash" IS NULL OR "guest_subject_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "checkout_draft_status_check" CHECK ("status" IN ('pending_session', 'checkout_created', 'quarantined', 'paid', 'fulfilled', 'expired', 'failed')),
	CONSTRAINT "checkout_draft_currency_check" CHECK ("currency" ~ '^[a-z]{3}$'),
	CONSTRAINT "checkout_draft_amounts_nonnegative_check" CHECK (
		"subtotal_minor" >= 0 AND "tax_minor" >= 0 AND "shipping_minor" >= 0
		AND "discount_minor" >= 0 AND "total_minor" >= 0 AND "affiliate_commission_minor" >= 0
	),
	CONSTRAINT "checkout_draft_safe_minor_check" CHECK (
		"subtotal_minor" <= 9007199254740991 AND "tax_minor" <= 9007199254740991
		AND "shipping_minor" <= 9007199254740991 AND "discount_minor" <= 9007199254740991
		AND "total_minor" <= 9007199254740991 AND "affiliate_commission_minor" <= 9007199254740991
	),
	CONSTRAINT "checkout_draft_total_check" CHECK (
		"total_minor" = "subtotal_minor" + "tax_minor" + "shipping_minor" - "discount_minor"
	)
);
--> statement-breakpoint
CREATE TABLE "checkout_draft_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"draft_id" text NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" text NOT NULL,
	"product_sku" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_minor" bigint NOT NULL,
	"total_price_minor" bigint NOT NULL,
	"track_inventory" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "checkout_draft_item_draft_id_checkout_draft_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."checkout_draft"("id") ON DELETE cascade,
	CONSTRAINT "checkout_draft_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id"),
	CONSTRAINT "checkout_draft_item_quantity_check" CHECK ("quantity" > 0),
	CONSTRAINT "checkout_draft_item_price_check" CHECK ("unit_price_minor" >= 0 AND "total_price_minor" >= 0),
	CONSTRAINT "checkout_draft_item_safe_minor_check" CHECK ("unit_price_minor" <= 9007199254740991 AND "total_price_minor" <= 9007199254740991),
	CONSTRAINT "checkout_draft_item_total_check" CHECK ("total_price_minor" = "unit_price_minor" * "quantity")
);
--> statement-breakpoint
CREATE TABLE "checkout_inventory_reservation" (
	"id" serial PRIMARY KEY NOT NULL,
	"draft_id" text NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"released_at" timestamp with time zone,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "checkout_inventory_reservation_draft_id_checkout_draft_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."checkout_draft"("id") ON DELETE cascade,
	CONSTRAINT "checkout_inventory_reservation_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id"),
	CONSTRAINT "checkout_inventory_reservation_quantity_check" CHECK ("quantity" > 0),
	CONSTRAINT "checkout_inventory_reservation_status_check" CHECK ("status" IN ('active', 'released', 'consumed')),
	CONSTRAINT "checkout_inventory_reservation_status_timestamp_check" CHECK (
		("status" = 'active' AND "released_at" IS NULL AND "consumed_at" IS NULL)
		OR ("status" = 'released' AND "released_at" IS NOT NULL AND "consumed_at" IS NULL)
		OR ("status" = 'consumed' AND "consumed_at" IS NOT NULL AND "released_at" IS NULL)
	)
);
--> statement-breakpoint
CREATE TABLE "checkout_payment_attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"draft_id" text NOT NULL,
	"attempt_number" integer NOT NULL,
	"provider" text DEFAULT 'stripe' NOT NULL,
	"provider_idempotency_key" text NOT NULL,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"status" text DEFAULT 'pending_session' NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" varchar(3) NOT NULL,
	"last_error_code" text,
	"last_error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "checkout_payment_attempt_draft_id_checkout_draft_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."checkout_draft"("id") ON DELETE cascade,
	CONSTRAINT "checkout_payment_attempt_provider_idempotency_key_unique" UNIQUE("provider_idempotency_key"),
	CONSTRAINT "checkout_payment_attempt_draft_attempt_unique" UNIQUE("draft_id", "attempt_number"),
	CONSTRAINT "checkout_payment_attempt_id_draft_unique" UNIQUE("id", "draft_id"),
	CONSTRAINT "checkout_payment_attempt_stripe_session_id_unique" UNIQUE("stripe_session_id"),
	CONSTRAINT "checkout_payment_attempt_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id"),
	CONSTRAINT "checkout_payment_attempt_number_check" CHECK ("attempt_number" > 0),
	CONSTRAINT "checkout_payment_attempt_provider_check" CHECK ("provider" = 'stripe'),
	CONSTRAINT "checkout_payment_attempt_status_check" CHECK ("status" IN ('pending_session', 'checkout_created', 'quarantined', 'paid', 'expired', 'failed', 'superseded')),
	CONSTRAINT "checkout_payment_attempt_currency_check" CHECK ("currency" ~ '^[a-z]{3}$'),
	CONSTRAINT "checkout_payment_attempt_amount_check" CHECK ("amount_minor" >= 0),
	CONSTRAINT "checkout_payment_attempt_safe_minor_check" CHECK ("amount_minor" <= 9007199254740991)
);
--> statement-breakpoint
CREATE TABLE "guest_order_access_grant" (
	"id" text PRIMARY KEY NOT NULL,
	"draft_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"scope" text DEFAULT 'confirmation' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guest_order_access_grant_draft_id_checkout_draft_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."checkout_draft"("id") ON DELETE cascade,
	CONSTRAINT "guest_order_access_grant_token_hash_unique" UNIQUE("token_hash"),
	CONSTRAINT "guest_order_access_grant_scope_check" CHECK ("scope" = 'confirmation'),
	CONSTRAINT "guest_order_access_grant_token_hash_check" CHECK ("token_hash" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "stripe_webhook_event" (
	"id" text PRIMARY KEY NOT NULL,
	"draft_id" text,
	"payment_attempt_id" text,
	"event_type" text NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_error_code" text,
	"last_error_message" text,
	"payload_digest" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processing_at" timestamp with time zone,
	"processed_at" timestamp with time zone,
	CONSTRAINT "stripe_webhook_event_payment_attempt_draft_fk" FOREIGN KEY ("payment_attempt_id", "draft_id") REFERENCES "public"."checkout_payment_attempt"("id", "draft_id"),
	CONSTRAINT "stripe_webhook_event_status_check" CHECK ("status" IN ('received', 'processing', 'processed', 'ignored', 'failed')),
	CONSTRAINT "stripe_webhook_event_attempt_count_check" CHECK ("attempt_count" >= 0),
	CONSTRAINT "stripe_webhook_event_payload_digest_check" CHECK ("payload_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "stripe_webhook_event_attempt_link_check" CHECK (("payment_attempt_id" IS NULL) = ("draft_id" IS NULL)),
	CONSTRAINT "stripe_webhook_event_lifecycle_timestamp_check" CHECK (
		("status" = 'received' AND "processing_at" IS NULL AND "processed_at" IS NULL)
		OR ("status" IN ('processing', 'failed') AND "processing_at" IS NOT NULL AND "processed_at" IS NULL)
		OR ("status" IN ('processed', 'ignored') AND "processing_at" IS NOT NULL AND "processed_at" IS NOT NULL)
	)
);
--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "checkout_draft_id" text;
--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "stripe_session_id" text;
--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "stripe_payment_intent_id" text;
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "reserved_quantity" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint
		WHERE conname = 'order_checkout_draft_id_checkout_draft_id_fk'
			AND conrelid = 'order'::regclass
	) THEN
		ALTER TABLE "order" ADD CONSTRAINT "order_checkout_draft_id_checkout_draft_id_fk"
			FOREIGN KEY ("checkout_draft_id") REFERENCES "public"."checkout_draft"("id");
	END IF;
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint
		WHERE conname = 'product_reserved_quantity_nonnegative_check'
			AND conrelid = 'product'::regclass
	) THEN
		ALTER TABLE "product" ADD CONSTRAINT "product_reserved_quantity_nonnegative_check" CHECK ("reserved_quantity" >= 0);
	END IF;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "checkout_draft_reference_idx" ON "checkout_draft" USING btree ("reference");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "checkout_draft_user_status_idx" ON "checkout_draft" USING btree ("user_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "checkout_draft_guest_status_idx" ON "checkout_draft" USING btree ("guest_subject_hash", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "checkout_draft_expires_idx" ON "checkout_draft" USING btree ("expires_at");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "checkout_draft_active_source_cart_idx" ON "checkout_draft" USING btree ("source_cart_id") WHERE "source_cart_id" IS NOT NULL AND "status" IN ('pending_session', 'checkout_created', 'quarantined', 'paid');
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "checkout_draft_item_draft_idx" ON "checkout_draft_item" USING btree ("draft_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "checkout_draft_item_product_idx" ON "checkout_draft_item" USING btree ("draft_id", "product_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "checkout_inventory_reservation_draft_product_idx" ON "checkout_inventory_reservation" USING btree ("draft_id", "product_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "checkout_inventory_reservation_status_idx" ON "checkout_inventory_reservation" USING btree ("status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "checkout_payment_attempt_draft_attempt_idx" ON "checkout_payment_attempt" USING btree ("draft_id", "attempt_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "checkout_payment_attempt_draft_idx" ON "checkout_payment_attempt" USING btree ("draft_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "checkout_payment_attempt_active_draft_idx" ON "checkout_payment_attempt" USING btree ("draft_id") WHERE "status" IN ('pending_session', 'checkout_created', 'quarantined', 'paid');
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "checkout_payment_attempt_stripe_session_idx" ON "checkout_payment_attempt" USING btree ("stripe_session_id") WHERE "stripe_session_id" IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "checkout_payment_attempt_payment_intent_idx" ON "checkout_payment_attempt" USING btree ("stripe_payment_intent_id") WHERE "stripe_payment_intent_id" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "guest_order_access_grant_draft_idx" ON "guest_order_access_grant" USING btree ("draft_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "guest_order_access_grant_expires_idx" ON "guest_order_access_grant" USING btree ("expires_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stripe_webhook_event_draft_idx" ON "stripe_webhook_event" USING btree ("draft_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stripe_webhook_event_attempt_idx" ON "stripe_webhook_event" USING btree ("payment_attempt_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stripe_webhook_event_status_idx" ON "stripe_webhook_event" USING btree ("status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "order_checkout_draft_id_unique" ON "order" USING btree ("checkout_draft_id") WHERE "checkout_draft_id" IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "order_stripe_session_idx" ON "order" USING btree ("stripe_session_id") WHERE "stripe_session_id" IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "order_stripe_payment_intent_idx" ON "order" USING btree ("stripe_payment_intent_id") WHERE "stripe_payment_intent_id" IS NOT NULL;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "prevent_checkout_draft_snapshot_mutation"() RETURNS trigger AS $$
BEGIN
	IF TG_OP = 'DELETE' THEN
		RAISE EXCEPTION 'checkout draft snapshots cannot be deleted';
	END IF;

	IF NEW.id IS DISTINCT FROM OLD.id
		OR NEW.reference IS DISTINCT FROM OLD.reference
		OR NEW.user_id IS DISTINCT FROM OLD.user_id
		OR NEW.guest_subject_hash IS DISTINCT FROM OLD.guest_subject_hash
		OR NEW.source_cart_id IS DISTINCT FROM OLD.source_cart_id
		OR NEW.source_cart_updated_at IS DISTINCT FROM OLD.source_cart_updated_at
		OR NEW.affiliate_link_id IS DISTINCT FROM OLD.affiliate_link_id
		OR NEW.affiliate_commission_minor IS DISTINCT FROM OLD.affiliate_commission_minor
		OR NEW.currency IS DISTINCT FROM OLD.currency
		OR NEW.subtotal_minor IS DISTINCT FROM OLD.subtotal_minor
		OR NEW.tax_minor IS DISTINCT FROM OLD.tax_minor
		OR NEW.shipping_minor IS DISTINCT FROM OLD.shipping_minor
		OR NEW.discount_minor IS DISTINCT FROM OLD.discount_minor
		OR NEW.total_minor IS DISTINCT FROM OLD.total_minor
		OR NEW.snapshot_hash IS DISTINCT FROM OLD.snapshot_hash
		OR NEW.created_at IS DISTINCT FROM OLD.created_at
		OR NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN
		RAISE EXCEPTION 'checkout draft snapshot fields are immutable';
	END IF;

	IF NOT (
		(OLD.status = 'pending_session' AND NEW.status IN ('checkout_created', 'quarantined', 'expired', 'failed'))
		OR (OLD.status = 'checkout_created' AND NEW.status IN ('quarantined', 'paid', 'expired', 'failed'))
		OR (OLD.status = 'quarantined' AND NEW.status = 'expired')
		OR (OLD.status = 'paid' AND NEW.status = 'fulfilled')
		OR NEW.status = OLD.status
	) THEN
		RAISE EXCEPTION 'checkout draft status transition from % to % is not allowed', OLD.status, NEW.status;
	END IF;

	IF OLD.reservation_released_at IS NOT NULL
		AND NEW.reservation_released_at IS DISTINCT FROM OLD.reservation_released_at THEN
		RAISE EXCEPTION 'checkout draft reservation release timestamp is immutable once set';
	END IF;

	IF NEW.status IN ('expired', 'failed') AND NEW.reservation_released_at IS NULL THEN
		RAISE EXCEPTION 'expired or failed checkout drafts require a reservation release timestamp';
	END IF;

	IF NEW.status NOT IN ('expired', 'failed') AND NEW.reservation_released_at IS NOT NULL THEN
		RAISE EXCEPTION 'only expired or failed checkout drafts may release reservations';
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_trigger
		WHERE tgname = 'checkout_draft_snapshot_immutable'
			AND tgrelid = 'checkout_draft'::regclass
	) THEN
		EXECUTE 'CREATE TRIGGER checkout_draft_snapshot_immutable BEFORE UPDATE OR DELETE ON checkout_draft FOR EACH ROW EXECUTE FUNCTION prevent_checkout_draft_snapshot_mutation()';
	END IF;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "guard_checkout_inventory_reservation"() RETURNS trigger AS $$
DECLARE
	draft_item record;
BEGIN
	IF TG_OP = 'DELETE' THEN
		RAISE EXCEPTION 'checkout inventory reservations cannot be deleted';
	END IF;

	SELECT quantity, track_inventory
	INTO draft_item
	FROM checkout_draft_item
	WHERE draft_id = NEW.draft_id AND product_id = NEW.product_id;

	IF NOT FOUND OR NOT draft_item.track_inventory OR draft_item.quantity <> NEW.quantity THEN
		RAISE EXCEPTION 'checkout inventory reservation must exactly match a tracked draft item';
	END IF;

	IF TG_OP = 'INSERT' THEN
		IF NEW.status <> 'active' OR NEW.released_at IS NOT NULL OR NEW.consumed_at IS NOT NULL THEN
			RAISE EXCEPTION 'checkout inventory reservations must start active without terminal timestamps';
		END IF;
		RETURN NEW;
	END IF;

	IF NEW.id IS DISTINCT FROM OLD.id
		OR NEW.draft_id IS DISTINCT FROM OLD.draft_id
		OR NEW.product_id IS DISTINCT FROM OLD.product_id
		OR NEW.quantity IS DISTINCT FROM OLD.quantity
		OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
		RAISE EXCEPTION 'checkout inventory reservation identity is immutable';
	END IF;

	IF OLD.status <> 'active' OR NEW.status NOT IN ('released', 'consumed') THEN
		RAISE EXCEPTION 'checkout inventory reservation status transition from % to % is not allowed', OLD.status, NEW.status;
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER checkout_inventory_reservation_guard
BEFORE INSERT OR UPDATE OR DELETE ON checkout_inventory_reservation
FOR EACH ROW EXECUTE FUNCTION guard_checkout_inventory_reservation();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "guard_checkout_payment_attempt"() RETURNS trigger AS $$
DECLARE
	draft_snapshot record;
BEGIN
	IF TG_OP = 'DELETE' THEN
		RAISE EXCEPTION 'checkout payment attempts cannot be deleted';
	END IF;

	SELECT total_minor, currency, status, expires_at
	INTO draft_snapshot
	FROM checkout_draft
	WHERE id = NEW.draft_id;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'checkout payment attempt requires an existing checkout draft';
	END IF;

	IF NEW.amount_minor IS DISTINCT FROM draft_snapshot.total_minor
		OR NEW.currency IS DISTINCT FROM draft_snapshot.currency THEN
		RAISE EXCEPTION 'checkout payment attempt amount and currency must match its immutable draft';
	END IF;

	IF TG_OP = 'INSERT' THEN
		IF draft_snapshot.status <> 'pending_session' OR draft_snapshot.expires_at <= clock_timestamp() THEN
			RAISE EXCEPTION 'checkout payment attempts may only start on an unexpired pending draft';
		END IF;
		IF NEW.status <> 'pending_session'
			OR NEW.stripe_session_id IS NOT NULL
			OR NEW.stripe_payment_intent_id IS NOT NULL THEN
			RAISE EXCEPTION 'checkout payment attempts must start pending without Stripe identifiers';
		END IF;
		RETURN NEW;
	END IF;

	IF NEW.id IS DISTINCT FROM OLD.id
		OR NEW.draft_id IS DISTINCT FROM OLD.draft_id
		OR NEW.attempt_number IS DISTINCT FROM OLD.attempt_number
		OR NEW.provider IS DISTINCT FROM OLD.provider
		OR NEW.provider_idempotency_key IS DISTINCT FROM OLD.provider_idempotency_key
		OR NEW.amount_minor IS DISTINCT FROM OLD.amount_minor
		OR NEW.currency IS DISTINCT FROM OLD.currency
		OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
		RAISE EXCEPTION 'checkout payment attempt identity and settlement amount are immutable';
	END IF;

	IF NEW.stripe_session_id IS DISTINCT FROM OLD.stripe_session_id
		AND NOT (OLD.stripe_session_id IS NULL AND NEW.stripe_session_id IS NOT NULL) THEN
		RAISE EXCEPTION 'Stripe session ID may only be set once';
	END IF;

	IF NEW.stripe_payment_intent_id IS DISTINCT FROM OLD.stripe_payment_intent_id
		AND NOT (OLD.stripe_payment_intent_id IS NULL AND NEW.stripe_payment_intent_id IS NOT NULL) THEN
		RAISE EXCEPTION 'Stripe payment intent ID may only be set once';
	END IF;

	IF NOT (
		(OLD.status = 'pending_session' AND NEW.status IN ('checkout_created', 'quarantined', 'expired', 'failed', 'superseded'))
		OR (OLD.status = 'checkout_created' AND NEW.status IN ('quarantined', 'paid', 'expired', 'failed', 'superseded'))
		OR (OLD.status = 'quarantined' AND NEW.status = 'expired')
	) THEN
		RAISE EXCEPTION 'checkout payment attempt status transition from % to % is not allowed', OLD.status, NEW.status;
	END IF;

	IF NEW.status IN ('checkout_created', 'quarantined')
		AND (draft_snapshot.status <> 'pending_session' OR draft_snapshot.expires_at <= clock_timestamp()) THEN
		RAISE EXCEPTION 'a Stripe session may only be attached to an unexpired pending checkout draft';
	END IF;

	IF NEW.status = 'paid' AND draft_snapshot.status <> 'checkout_created' THEN
		RAISE EXCEPTION 'a payment attempt may only become paid while its draft is checkout-created';
	END IF;

	IF NEW.status IN ('checkout_created', 'quarantined', 'paid') AND NEW.stripe_session_id IS NULL THEN
		RAISE EXCEPTION 'active Stripe checkout attempts require a Stripe session ID';
	END IF;

	IF NEW.status = 'paid' AND NEW.stripe_payment_intent_id IS NULL THEN
		RAISE EXCEPTION 'paid Stripe checkout attempts require a payment intent ID';
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER checkout_payment_attempt_guard
BEFORE INSERT OR UPDATE OR DELETE ON checkout_payment_attempt
FOR EACH ROW EXECUTE FUNCTION guard_checkout_payment_attempt();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "guard_stripe_webhook_event"() RETURNS trigger AS $$
BEGIN
	IF TG_OP = 'DELETE' THEN
		RAISE EXCEPTION 'Stripe webhook event records cannot be deleted';
	END IF;

	IF TG_OP = 'INSERT' THEN
		IF NEW.status <> 'received'
			OR NEW.attempt_count <> 0
			OR NEW.processing_at IS NOT NULL
			OR NEW.processed_at IS NOT NULL THEN
			RAISE EXCEPTION 'Stripe webhook events must start received and unprocessed';
		END IF;
		RETURN NEW;
	END IF;

	IF NEW.id IS DISTINCT FROM OLD.id
		OR NEW.event_type IS DISTINCT FROM OLD.event_type
		OR NEW.payload_digest IS DISTINCT FROM OLD.payload_digest
		OR NEW.received_at IS DISTINCT FROM OLD.received_at THEN
		RAISE EXCEPTION 'Stripe webhook event identity and payload digest are immutable';
	END IF;

	IF (OLD.payment_attempt_id IS NOT NULL OR OLD.draft_id IS NOT NULL)
		AND (NEW.payment_attempt_id IS DISTINCT FROM OLD.payment_attempt_id OR NEW.draft_id IS DISTINCT FROM OLD.draft_id) THEN
		RAISE EXCEPTION 'Stripe webhook event payment attempt linkage is immutable once resolved';
	END IF;

	IF NEW.status = 'processing' THEN
		IF OLD.status IN ('received', 'failed') AND NEW.attempt_count = OLD.attempt_count + 1 THEN
			NULL;
		ELSIF OLD.status = 'processing'
			AND NEW.attempt_count = OLD.attempt_count
			AND OLD.payment_attempt_id IS NULL
			AND NEW.payment_attempt_id IS NOT NULL THEN
			NULL;
		ELSE
			RAISE EXCEPTION 'Stripe webhook events may only be claimed or linked while processing';
		END IF;
	ELSIF OLD.status = 'processing' AND NEW.status IN ('processed', 'ignored', 'failed') THEN
		IF NEW.attempt_count <> OLD.attempt_count THEN
			RAISE EXCEPTION 'Stripe webhook event terminal transitions must not alter attempt count';
		END IF;
	ELSE
		RAISE EXCEPTION 'Stripe webhook event status transition from % to % is not allowed', OLD.status, NEW.status;
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER stripe_webhook_event_guard
BEFORE INSERT OR UPDATE OR DELETE ON stripe_webhook_event
FOR EACH ROW EXECUTE FUNCTION guard_stripe_webhook_event();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "guard_guest_order_access_grant"() RETURNS trigger AS $$
DECLARE
	draft_owner_id text;
BEGIN
	IF TG_OP = 'DELETE' THEN
		RAISE EXCEPTION 'guest order access grants cannot be deleted';
	END IF;

	SELECT user_id INTO draft_owner_id FROM checkout_draft WHERE id = NEW.draft_id;
	IF NOT FOUND OR draft_owner_id IS NOT NULL THEN
		RAISE EXCEPTION 'guest order access grants may only belong to guest checkout drafts';
	END IF;

	IF TG_OP = 'INSERT' THEN
		IF NEW.revoked_at IS NOT NULL THEN
			RAISE EXCEPTION 'guest order access grants must start unrevoked';
		END IF;
		RETURN NEW;
	END IF;

	IF NEW.id IS DISTINCT FROM OLD.id
		OR NEW.draft_id IS DISTINCT FROM OLD.draft_id
		OR NEW.token_hash IS DISTINCT FROM OLD.token_hash
		OR NEW.scope IS DISTINCT FROM OLD.scope
		OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
		OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
		RAISE EXCEPTION 'guest order access grant capability fields are immutable';
	END IF;

	IF OLD.revoked_at IS NOT NULL AND NEW.revoked_at IS DISTINCT FROM OLD.revoked_at THEN
		RAISE EXCEPTION 'guest order access grant revocation is immutable once set';
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER guest_order_access_grant_guard
BEFORE INSERT OR UPDATE OR DELETE ON guest_order_access_grant
FOR EACH ROW EXECUTE FUNCTION guard_guest_order_access_grant();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "prevent_checkout_draft_item_mutation"() RETURNS trigger AS $$
BEGIN
	RAISE EXCEPTION 'checkout draft items are immutable';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_trigger
		WHERE tgname = 'checkout_draft_item_immutable'
			AND tgrelid = 'checkout_draft_item'::regclass
	) THEN
		EXECUTE 'CREATE TRIGGER checkout_draft_item_immutable BEFORE UPDATE OR DELETE ON checkout_draft_item FOR EACH ROW EXECUTE FUNCTION prevent_checkout_draft_item_mutation()';
	END IF;
END $$;
--> statement-breakpoint
COMMIT;
