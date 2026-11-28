CREATE TABLE "account_locks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"reason" text NOT NULL,
	"locked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unlock_token" text,
	"unlocked_at" timestamp with time zone
);

CREATE TABLE "affiliate" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"affiliate_code" text NOT NULL,
	"commission_rate" numeric(5, 4) DEFAULT '0.05' NOT NULL,
	"total_earnings" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"total_clicks" integer DEFAULT 0 NOT NULL,
	"total_conversions" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"website" text,
	"social_media" text,
	"audience" text,
	"promotion_method" text,
	"monthly_traffic" text,
	"why_join" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_affiliate_code_unique" UNIQUE("affiliate_code")
);

CREATE TABLE "affiliate_attribution" (
	"id" text PRIMARY KEY NOT NULL,
	"capability_hash" text NOT NULL,
	"affiliate_link_id" integer NOT NULL,
	"client_hash" text NOT NULL,
	"user_id" text,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "affiliate_attribution_click" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_attribution_id" text,
	"affiliate_link_id" integer NOT NULL,
	"client_hash" text NOT NULL,
	"user_id" text,
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "affiliate_click" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_link_id" integer NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"referer" text,
	"session_id" text,
	"user_id" text,
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "affiliate_click_dedupe" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_link_id" integer NOT NULL,
	"client_hash" text NOT NULL,
	"last_clicked_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "affiliate_commission_ledger" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" integer NOT NULL,
	"affiliate_link_id" integer NOT NULL,
	"source_order_id" integer NOT NULL,
	"source_checkout_draft_id" text NOT NULL,
	"source_stripe_webhook_event_id" text NOT NULL,
	"source_reference" text NOT NULL,
	"currency" varchar(3) NOT NULL,
	"quoted_amount_minor" bigint NOT NULL,
	"commission_rate_bps" integer NOT NULL,
	"draft_snapshot_hash" text NOT NULL,
	"tier_code" text NOT NULL,
	"tier_version" integer NOT NULL,
	"terms_version" text NOT NULL,
	"disclosure_version" text NOT NULL,
	"terms_acceptance_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_commission_ledger_amount_check" CHECK ("affiliate_commission_ledger"."quoted_amount_minor" > 0 AND "affiliate_commission_ledger"."quoted_amount_minor" <= 9007199254740991),
	CONSTRAINT "affiliate_commission_ledger_rate_bps_check" CHECK ("affiliate_commission_ledger"."commission_rate_bps" >= 0 AND "affiliate_commission_ledger"."commission_rate_bps" <= 10000),
	CONSTRAINT "affiliate_commission_ledger_currency_check" CHECK ("affiliate_commission_ledger"."currency" ~ '^[a-z]{3}$'),
	CONSTRAINT "affiliate_commission_ledger_tier_version_check" CHECK ("affiliate_commission_ledger"."tier_version" >= 0),
	CONSTRAINT "affiliate_commission_ledger_snapshot_hash_check" CHECK ("affiliate_commission_ledger"."draft_snapshot_hash" ~ '^[0-9a-f]{64}$')
);

CREATE TABLE "affiliate_commission_ledger_event" (
	"id" text PRIMARY KEY NOT NULL,
	"commission_id" text NOT NULL,
	"event_type" text NOT NULL,
	"amount_delta_minor" bigint NOT NULL,
	"currency" varchar(3) NOT NULL,
	"payout_id" text,
	"event_reference" text NOT NULL,
	"causation_reference" text,
	"reason_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_commission_ledger_event_amount_range_check" CHECK ("affiliate_commission_ledger_event"."amount_delta_minor" >= -9007199254740991 AND "affiliate_commission_ledger_event"."amount_delta_minor" <= 9007199254740991),
	CONSTRAINT "affiliate_commission_ledger_event_amount_shape_check" CHECK (("affiliate_commission_ledger_event"."event_type" = 'pending' AND "affiliate_commission_ledger_event"."amount_delta_minor" > 0) OR ("affiliate_commission_ledger_event"."event_type" = 'reversed' AND "affiliate_commission_ledger_event"."amount_delta_minor" < 0) OR ("affiliate_commission_ledger_event"."event_type" IN ('approved', 'payable', 'paid') AND "affiliate_commission_ledger_event"."amount_delta_minor" = 0)),
	CONSTRAINT "affiliate_commission_ledger_event_currency_check" CHECK ("affiliate_commission_ledger_event"."currency" ~ '^[a-z]{3}$'),
	CONSTRAINT "affiliate_commission_ledger_event_payout_link_check" CHECK (("affiliate_commission_ledger_event"."event_type" IN ('payable', 'paid')) = ("affiliate_commission_ledger_event"."payout_id" IS NOT NULL))
);

CREATE TABLE "affiliate_link" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"link_code" text NOT NULL,
	"original_url" text NOT NULL,
	"affiliate_url" text NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"earnings" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_link_link_code_unique" UNIQUE("link_code")
);

CREATE TABLE "affiliate_payout" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" integer NOT NULL,
	"payout_reference" text NOT NULL,
	"currency" varchar(3) NOT NULL,
	"amount_minor" bigint NOT NULL,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_payout_amount_check" CHECK ("affiliate_payout"."amount_minor" > 0 AND "affiliate_payout"."amount_minor" <= 9007199254740991),
	CONSTRAINT "affiliate_payout_currency_check" CHECK ("affiliate_payout"."currency" ~ '^[a-z]{3}$'),
	CONSTRAINT "affiliate_payout_period_check" CHECK ("affiliate_payout"."period_start" IS NULL OR "affiliate_payout"."period_end" IS NULL OR "affiliate_payout"."period_start" <= "affiliate_payout"."period_end")
);

CREATE TABLE "affiliate_terms_acceptance" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" integer NOT NULL,
	"terms_version" text NOT NULL,
	"disclosure_version" text NOT NULL,
	"acceptance_reference" text NOT NULL,
	"accepted_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "affiliate_tier" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"version" integer NOT NULL,
	"commission_rate_bps" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_tier_version_check" CHECK ("affiliate_tier"."version" >= 0),
	CONSTRAINT "affiliate_tier_rate_bps_check" CHECK ("affiliate_tier"."commission_rate_bps" >= 0 AND "affiliate_tier"."commission_rate_bps" <= 10000)
);

CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"details" text
);

CREATE TABLE "cart" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"session_id" text,
	"affiliate_link_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_identity_check" CHECK (("cart"."user_id" IS NULL) <> ("cart"."session_id" IS NULL))
);

CREATE TABLE "cart_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "catalog_seed_category" (
	"source_id" text PRIMARY KEY NOT NULL,
	"manifest_version" text NOT NULL,
	"manifest_hash" text NOT NULL,
	"category_id" integer NOT NULL,
	"managed_snapshot" jsonb NOT NULL,
	"managed_hash" text NOT NULL,
	"is_retired" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_seed_category_manifest_hash_check" CHECK ("catalog_seed_category"."manifest_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "catalog_seed_category_managed_hash_check" CHECK ("catalog_seed_category"."managed_hash" ~ '^[0-9a-f]{64}$')
);

CREATE TABLE "catalog_seed_collection" (
	"source_id" text PRIMARY KEY NOT NULL,
	"manifest_version" text NOT NULL,
	"manifest_hash" text NOT NULL,
	"category_id" integer NOT NULL,
	"managed_snapshot" jsonb NOT NULL,
	"managed_hash" text NOT NULL,
	"is_retired" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_seed_collection_manifest_hash_check" CHECK ("catalog_seed_collection"."manifest_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "catalog_seed_collection_managed_hash_check" CHECK ("catalog_seed_collection"."managed_hash" ~ '^[0-9a-f]{64}$')
);

CREATE TABLE "catalog_seed_item" (
	"source_id" text PRIMARY KEY NOT NULL,
	"manifest_version" text NOT NULL,
	"manifest_hash" text NOT NULL,
	"product_id" integer NOT NULL,
	"offering_kind" text NOT NULL,
	"price_semantics" text NOT NULL,
	"managed_fields" jsonb NOT NULL,
	"managed_snapshot" jsonb NOT NULL,
	"managed_hash" text NOT NULL,
	"is_retired" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "catalog_seed_item_manifest_hash_check" CHECK ("catalog_seed_item"."manifest_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "catalog_seed_item_managed_hash_check" CHECK ("catalog_seed_item"."managed_hash" ~ '^[0-9a-f]{64}$')
);

CREATE TABLE "catalog_seed_run" (
	"run_id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"status" text NOT NULL,
	"manifest_version" text NOT NULL,
	"manifest_hash" text NOT NULL,
	"release_id" text NOT NULL,
	"release_commit" text NOT NULL,
	"schema_fingerprint" text NOT NULL,
	"rollback_of_run_id" text,
	"preimage" jsonb NOT NULL,
	"changes" jsonb NOT NULL,
	"change_hash" text NOT NULL,
	"summary" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "catalog_seed_run_manifest_hash_check" CHECK ("catalog_seed_run"."manifest_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "catalog_seed_run_change_hash_check" CHECK ("catalog_seed_run"."change_hash" ~ '^[0-9a-f]{64}$')
);

CREATE TABLE "checkout_draft" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"user_id" text,
	"guest_subject_hash" text,
	"source_cart_id" integer,
	"source_cart_updated_at" timestamp with time zone,
	"affiliate_link_id" integer,
	"affiliate_commission_minor" bigint DEFAULT 0 NOT NULL,
	"affiliate_id" integer,
	"affiliate_commission_rate_bps" integer,
	"affiliate_tier_code" text DEFAULT 'legacy-rate' NOT NULL,
	"affiliate_tier_version" integer DEFAULT 0 NOT NULL,
	"affiliate_terms_version" text DEFAULT 'unrecorded' NOT NULL,
	"affiliate_disclosure_version" text DEFAULT 'unrecorded' NOT NULL,
	"affiliate_terms_acceptance_id" text,
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
	CONSTRAINT "checkout_draft_buyer_identity_check" CHECK (("checkout_draft"."user_id" IS NULL) <> ("checkout_draft"."guest_subject_hash" IS NULL)),
	CONSTRAINT "checkout_draft_guest_subject_hash_check" CHECK ("checkout_draft"."guest_subject_hash" IS NULL OR "checkout_draft"."guest_subject_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "checkout_draft_currency_check" CHECK ("checkout_draft"."currency" ~ '^[a-z]{3}$'),
	CONSTRAINT "checkout_draft_amounts_nonnegative_check" CHECK ("checkout_draft"."subtotal_minor" >= 0 AND "checkout_draft"."tax_minor" >= 0 AND "checkout_draft"."shipping_minor" >= 0 AND "checkout_draft"."discount_minor" >= 0 AND "checkout_draft"."total_minor" >= 0 AND "checkout_draft"."affiliate_commission_minor" >= 0),
	CONSTRAINT "checkout_draft_affiliate_policy_pair_check" CHECK (("checkout_draft"."affiliate_id" IS NULL) = ("checkout_draft"."affiliate_commission_rate_bps" IS NULL)),
	CONSTRAINT "checkout_draft_affiliate_rate_bps_check" CHECK ("checkout_draft"."affiliate_commission_rate_bps" IS NULL OR ("checkout_draft"."affiliate_commission_rate_bps" >= 0 AND "checkout_draft"."affiliate_commission_rate_bps" <= 10000)),
	CONSTRAINT "checkout_draft_affiliate_tier_version_check" CHECK ("checkout_draft"."affiliate_tier_version" >= 0),
	CONSTRAINT "checkout_draft_safe_minor_check" CHECK ("checkout_draft"."subtotal_minor" <= 9007199254740991 AND "checkout_draft"."tax_minor" <= 9007199254740991 AND "checkout_draft"."shipping_minor" <= 9007199254740991 AND "checkout_draft"."discount_minor" <= 9007199254740991 AND "checkout_draft"."total_minor" <= 9007199254740991 AND "checkout_draft"."affiliate_commission_minor" <= 9007199254740991),
	CONSTRAINT "checkout_draft_total_check" CHECK ("checkout_draft"."total_minor" = "checkout_draft"."subtotal_minor" + "checkout_draft"."tax_minor" + "checkout_draft"."shipping_minor" - "checkout_draft"."discount_minor")
);

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
	CONSTRAINT "checkout_draft_item_quantity_check" CHECK ("checkout_draft_item"."quantity" > 0),
	CONSTRAINT "checkout_draft_item_price_check" CHECK ("checkout_draft_item"."unit_price_minor" >= 0 AND "checkout_draft_item"."total_price_minor" >= 0),
	CONSTRAINT "checkout_draft_item_safe_minor_check" CHECK ("checkout_draft_item"."unit_price_minor" <= 9007199254740991 AND "checkout_draft_item"."total_price_minor" <= 9007199254740991),
	CONSTRAINT "checkout_draft_item_total_check" CHECK ("checkout_draft_item"."total_price_minor" = "checkout_draft_item"."unit_price_minor" * "checkout_draft_item"."quantity")
);

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
	CONSTRAINT "checkout_inventory_reservation_quantity_check" CHECK ("checkout_inventory_reservation"."quantity" > 0),
	CONSTRAINT "checkout_inventory_reservation_status_timestamp_check" CHECK (("checkout_inventory_reservation"."status" = 'active' AND "checkout_inventory_reservation"."released_at" IS NULL AND "checkout_inventory_reservation"."consumed_at" IS NULL) OR ("checkout_inventory_reservation"."status" = 'released' AND "checkout_inventory_reservation"."released_at" IS NOT NULL AND "checkout_inventory_reservation"."consumed_at" IS NULL) OR ("checkout_inventory_reservation"."status" = 'consumed' AND "checkout_inventory_reservation"."consumed_at" IS NOT NULL AND "checkout_inventory_reservation"."released_at" IS NULL))
);

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
	CONSTRAINT "checkout_payment_attempt_provider_idempotency_key_unique" UNIQUE("provider_idempotency_key"),
	CONSTRAINT "checkout_payment_attempt_number_check" CHECK ("checkout_payment_attempt"."attempt_number" > 0),
	CONSTRAINT "checkout_payment_attempt_amount_check" CHECK ("checkout_payment_attempt"."amount_minor" >= 0),
	CONSTRAINT "checkout_payment_attempt_safe_minor_check" CHECK ("checkout_payment_attempt"."amount_minor" <= 9007199254740991),
	CONSTRAINT "checkout_payment_attempt_currency_check" CHECK ("checkout_payment_attempt"."currency" ~ '^[a-z]{3}$')
);

CREATE TABLE "cms_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"excerpt" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"author_id" text,
	"seo_fields_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "cms_content_slug_unique" UNIQUE("slug")
);

CREATE TABLE "cms_seo_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" text NOT NULL,
	"page_type" text DEFAULT 'page' NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"og_title" text,
	"og_description" text,
	"og_image" text,
	"robots" text DEFAULT 'index, follow',
	"canonical_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cms_seo_fields_page_id_unique" UNIQUE("page_id")
);

CREATE TABLE "content_page" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text,
	"excerpt" text,
	"type" text DEFAULT 'page' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"author_id" text NOT NULL,
	"featured_image_file_id" text,
	"meta_title" text,
	"meta_description" text,
	"tags" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_page_slug_unique" UNIQUE("slug")
);

CREATE TABLE "email_change_capability" (
	"user_id" text PRIMARY KEY NOT NULL,
	"previous_email" text NOT NULL,
	"pending_email" text NOT NULL,
	"new_email_token_hash" text,
	"previous_email_token_hash" text,
	"new_email_proved_at" timestamp with time zone,
	"previous_email_confirmed_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "email_verification_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);

CREATE TABLE "file" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"bucket_path" text NOT NULL,
	"bucket_name" text DEFAULT 'aevani-assets' NOT NULL,
	"entity_type" text DEFAULT 'general' NOT NULL,
	"entity_id" text,
	"uploaded_by" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "guest_order_access_grant" (
	"id" text PRIMARY KEY NOT NULL,
	"draft_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"scope" text DEFAULT 'confirmation' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guest_order_access_grant_token_hash_unique" UNIQUE("token_hash"),
	CONSTRAINT "guest_order_access_grant_token_hash_check" CHECK ("guest_order_access_grant"."token_hash" ~ '^[0-9a-f]{64}$')
);

CREATE TABLE "login_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"identifier_type" text NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"last_attempt" timestamp with time zone DEFAULT now() NOT NULL,
	"blocked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "order" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"checkout_draft_id" text,
	"user_id" text,
	"affiliate_link_id" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"subtotal_amount" numeric(10, 2) NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"shipping_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"affiliate_commission" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"shipping_address" text,
	"billing_address" text,
	"customer_email" text NOT NULL,
	"customer_phone" text,
	"notes" text,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_order_number_unique" UNIQUE("order_number")
);

CREATE TABLE "order_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" text NOT NULL,
	"product_sku" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "password_reset_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"short_description" text,
	"sku" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"compare_price" numeric(10, 2),
	"cost_price" numeric(10, 2),
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"reserved_quantity" integer DEFAULT 0 NOT NULL,
	"track_inventory" boolean DEFAULT true NOT NULL,
	"weight" numeric(8, 2),
	"dimensions" text,
	"category_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"coming_soon" boolean,
	"tags" text,
	"meta_title" text,
	"meta_description" text,
	"description_html" text,
	"key_features" jsonb,
	"stats" jsonb,
	"specs" jsonb,
	"in_the_box" jsonb,
	"faqs" jsonb,
	"badges" jsonb,
	"test_bed_note" text,
	"warranty" text,
	"shipping_note" text,
	"bundle_offer" jsonb,
	"related_product_ids" jsonb,
	"currency" text DEFAULT 'USD' NOT NULL,
	"rating_average" numeric(3, 2),
	"review_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_slug_unique" UNIQUE("slug"),
	CONSTRAINT "product_sku_unique" UNIQUE("sku"),
	CONSTRAINT "product_reserved_quantity_nonnegative_check" CHECK ("product"."reserved_quantity" >= 0)
);

CREATE TABLE "product_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"parent_id" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_category_name_unique" UNIQUE("name"),
	CONSTRAINT "product_category_slug_unique" UNIQUE("slug")
);

CREATE TABLE "product_image" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"file_id" text NOT NULL,
	"alt_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_main" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "product_review" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"author_name" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"is_verified_purchase" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_review_rating_range_check" CHECK ("product_review"."rating" between 1 and 5)
);

CREATE TABLE "seller_application" (
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

CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"remember_me" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_accessed_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "social_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

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
	CONSTRAINT "stripe_webhook_event_attempt_count_check" CHECK ("stripe_webhook_event"."attempt_count" >= 0),
	CONSTRAINT "stripe_webhook_event_payload_digest_check" CHECK ("stripe_webhook_event"."payload_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "stripe_webhook_event_attempt_link_check" CHECK (("stripe_webhook_event"."payment_attempt_id" IS NULL) = ("stripe_webhook_event"."draft_id" IS NULL)),
	CONSTRAINT "stripe_webhook_event_lifecycle_timestamp_check" CHECK (("stripe_webhook_event"."status" = 'received' AND "stripe_webhook_event"."processing_at" IS NULL AND "stripe_webhook_event"."processed_at" IS NULL) OR ("stripe_webhook_event"."status" IN ('processing', 'failed') AND "stripe_webhook_event"."processing_at" IS NOT NULL AND "stripe_webhook_event"."processed_at" IS NULL) OR ("stripe_webhook_event"."status" IN ('processed', 'ignored') AND "stripe_webhook_event"."processing_at" IS NOT NULL AND "stripe_webhook_event"."processed_at" IS NOT NULL))
);

CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"avatar_file_id" text,
	"role" text DEFAULT 'customer' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"pending_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);

CREATE TABLE "wishlist_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_badge" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon_file_id" text,
	"trigger_type" text NOT NULL,
	"trigger_config" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_bookmark" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_certificate" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"template_id" text NOT NULL,
	"certificate_uid" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lms_certificate_certificate_uid_unique" UNIQUE("certificate_uid")
);

CREATE TABLE "lms_certificate_template" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"html_template" text NOT NULL,
	"css_styles" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"course_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_content_block" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"content" text,
	"file_id" text,
	"config" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"completion_threshold" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_course" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"course_type" text DEFAULT 'self_paced' NOT NULL,
	"instructor_id" text,
	"thumbnail_file_id" text,
	"difficulty" text,
	"language" text DEFAULT 'en' NOT NULL,
	"duration_estimate" integer,
	"price" numeric(10, 2),
	"pricing_type" text DEFAULT 'free' NOT NULL,
	"enrollment_type" text DEFAULT 'open' NOT NULL,
	"max_enrollment" integer,
	"passing_score" integer DEFAULT 70 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"program_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"sequential_enabled" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lms_course_slug_unique" UNIQUE("slug")
);

CREATE TABLE "lms_course_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lms_course_category_slug_unique" UNIQUE("slug")
);

CREATE TABLE "lms_course_prerequisite" (
	"course_id" text NOT NULL,
	"prerequisite_course_id" text NOT NULL,
	CONSTRAINT "lms_course_prerequisite_course_id_prerequisite_course_id_pk" PRIMARY KEY("course_id","prerequisite_course_id")
);

CREATE TABLE "lms_course_product" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"product_category_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_course_review" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"review_text" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_course_tag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lms_course_tag_slug_unique" UNIQUE("slug")
);

CREATE TABLE "lms_course_to_category" (
	"course_id" text NOT NULL,
	"category_id" text NOT NULL,
	CONSTRAINT "lms_course_to_category_course_id_category_id_pk" PRIMARY KEY("course_id","category_id")
);

CREATE TABLE "lms_course_to_tag" (
	"course_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "lms_course_to_tag_course_id_tag_id_pk" PRIMARY KEY("course_id","tag_id")
);

CREATE TABLE "lms_discussion_reply" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"user_id" text NOT NULL,
	"parent_reply_id" text,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_discussion_thread" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"lesson_id" text,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"stripe_payment_id" text,
	"last_accessed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_learner_badge" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"badge_id" text NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_lesson" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"module_id" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"is_preview" boolean DEFAULT false NOT NULL,
	"estimated_minutes" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lms_lesson_slug_unique" UNIQUE("slug")
);

CREATE TABLE "lms_module" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"course_id" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lms_module_slug_unique" UNIQUE("slug")
);

CREATE TABLE "lms_note" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_program" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lms_program_slug_unique" UNIQUE("slug")
);

CREATE TABLE "lms_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"content_block_id" text,
	"lesson_id" text,
	"module_id" text,
	"status" text DEFAULT 'not_started' NOT NULL,
	"progress_percent" integer DEFAULT 0 NOT NULL,
	"metadata" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_question" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"prompt" text NOT NULL,
	"explanation" text,
	"config" text,
	"bank_id" text NOT NULL,
	"points" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_question_bank" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"course_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_question_option" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"label" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_quiz" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"lesson_id" text,
	"module_id" text,
	"course_id" text NOT NULL,
	"time_limit" integer,
	"passing_score" integer DEFAULT 70 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"randomize_questions" boolean DEFAULT false NOT NULL,
	"question_count" integer,
	"show_correct_answers" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_quiz_answer" (
	"id" text PRIMARY KEY NOT NULL,
	"attempt_id" text NOT NULL,
	"question_id" text NOT NULL,
	"answer" text NOT NULL,
	"is_correct" boolean,
	"points_awarded" integer DEFAULT 0 NOT NULL,
	"graded_by" text,
	"graded_at" timestamp with time zone,
	"feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lms_quiz_attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"quiz_id" text NOT NULL,
	"enrollment_id" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"score" integer,
	"total_points" integer,
	"passed" boolean,
	"time_spent" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "account_locks" ADD CONSTRAINT "account_locks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "affiliate" ADD CONSTRAINT "affiliate_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "affiliate_attribution" ADD CONSTRAINT "affiliate_attribution_affiliate_link_id_affiliate_link_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "public"."affiliate_link"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "affiliate_attribution" ADD CONSTRAINT "affiliate_attribution_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "affiliate_attribution_click" ADD CONSTRAINT "affiliate_attribution_click_affiliate_attribution_id_affiliate_attribution_id_fk" FOREIGN KEY ("affiliate_attribution_id") REFERENCES "public"."affiliate_attribution"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "affiliate_attribution_click" ADD CONSTRAINT "affiliate_attribution_click_affiliate_link_id_affiliate_link_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "public"."affiliate_link"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "affiliate_attribution_click" ADD CONSTRAINT "affiliate_attribution_click_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "affiliate_click" ADD CONSTRAINT "affiliate_click_affiliate_link_id_affiliate_link_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "public"."affiliate_link"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "affiliate_click" ADD CONSTRAINT "affiliate_click_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "affiliate_click_dedupe" ADD CONSTRAINT "affiliate_click_dedupe_affiliate_link_id_affiliate_link_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "public"."affiliate_link"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "affiliate_commission_ledger" ADD CONSTRAINT "affiliate_commission_ledger_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliate"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "affiliate_commission_ledger" ADD CONSTRAINT "affiliate_commission_ledger_affiliate_link_id_affiliate_link_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "public"."affiliate_link"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "affiliate_commission_ledger" ADD CONSTRAINT "affiliate_commission_ledger_source_order_id_order_id_fk" FOREIGN KEY ("source_order_id") REFERENCES "public"."order"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "affiliate_commission_ledger" ADD CONSTRAINT "affiliate_commission_ledger_source_checkout_draft_id_checkout_draft_id_fk" FOREIGN KEY ("source_checkout_draft_id") REFERENCES "public"."checkout_draft"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "affiliate_commission_ledger" ADD CONSTRAINT "affiliate_commission_ledger_source_stripe_webhook_event_id_stripe_webhook_event_id_fk" FOREIGN KEY ("source_stripe_webhook_event_id") REFERENCES "public"."stripe_webhook_event"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "affiliate_commission_ledger" ADD CONSTRAINT "affiliate_commission_ledger_terms_acceptance_id_affiliate_terms_acceptance_id_fk" FOREIGN KEY ("terms_acceptance_id") REFERENCES "public"."affiliate_terms_acceptance"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "affiliate_commission_ledger_event" ADD CONSTRAINT "affiliate_commission_ledger_event_commission_id_affiliate_commission_ledger_id_fk" FOREIGN KEY ("commission_id") REFERENCES "public"."affiliate_commission_ledger"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "affiliate_commission_ledger_event" ADD CONSTRAINT "affiliate_commission_ledger_event_payout_id_affiliate_payout_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."affiliate_payout"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "affiliate_link" ADD CONSTRAINT "affiliate_link_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliate"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "affiliate_link" ADD CONSTRAINT "affiliate_link_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "affiliate_payout" ADD CONSTRAINT "affiliate_payout_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliate"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "affiliate_terms_acceptance" ADD CONSTRAINT "affiliate_terms_acceptance_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliate"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "cart" ADD CONSTRAINT "cart_affiliate_link_id_affiliate_link_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "public"."affiliate_link"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "catalog_seed_category" ADD CONSTRAINT "catalog_seed_category_category_id_product_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_category"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "catalog_seed_collection" ADD CONSTRAINT "catalog_seed_collection_category_id_product_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_category"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "catalog_seed_item" ADD CONSTRAINT "catalog_seed_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "catalog_seed_run" ADD CONSTRAINT "catalog_seed_run_rollback_of_run_id_catalog_seed_run_run_id_fk" FOREIGN KEY ("rollback_of_run_id") REFERENCES "public"."catalog_seed_run"("run_id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "checkout_draft" ADD CONSTRAINT "checkout_draft_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "checkout_draft" ADD CONSTRAINT "checkout_draft_affiliate_link_id_affiliate_link_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "public"."affiliate_link"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "checkout_draft" ADD CONSTRAINT "checkout_draft_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliate"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "checkout_draft" ADD CONSTRAINT "checkout_draft_affiliate_terms_acceptance_id_affiliate_terms_acceptance_id_fk" FOREIGN KEY ("affiliate_terms_acceptance_id") REFERENCES "public"."affiliate_terms_acceptance"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "checkout_draft_item" ADD CONSTRAINT "checkout_draft_item_draft_id_checkout_draft_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."checkout_draft"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "checkout_draft_item" ADD CONSTRAINT "checkout_draft_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "checkout_inventory_reservation" ADD CONSTRAINT "checkout_inventory_reservation_draft_id_checkout_draft_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."checkout_draft"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "checkout_inventory_reservation" ADD CONSTRAINT "checkout_inventory_reservation_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "checkout_payment_attempt" ADD CONSTRAINT "checkout_payment_attempt_draft_id_checkout_draft_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."checkout_draft"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "cms_content" ADD CONSTRAINT "cms_content_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "cms_content" ADD CONSTRAINT "cms_content_seo_fields_id_cms_seo_fields_id_fk" FOREIGN KEY ("seo_fields_id") REFERENCES "public"."cms_seo_fields"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "content_page" ADD CONSTRAINT "content_page_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "email_change_capability" ADD CONSTRAINT "email_change_capability_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "email_verification_token" ADD CONSTRAINT "email_verification_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "file" ADD CONSTRAINT "file_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "guest_order_access_grant" ADD CONSTRAINT "guest_order_access_grant_draft_id_checkout_draft_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."checkout_draft"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "order" ADD CONSTRAINT "order_checkout_draft_id_checkout_draft_id_fk" FOREIGN KEY ("checkout_draft_id") REFERENCES "public"."checkout_draft"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "order" ADD CONSTRAINT "order_affiliate_link_id_affiliate_link_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "public"."affiliate_link"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_product_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_category"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_parent_id_product_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_category"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "product_review" ADD CONSTRAINT "product_review_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "stripe_webhook_event" ADD CONSTRAINT "stripe_webhook_event_payment_attempt_draft_fk" FOREIGN KEY ("payment_attempt_id","draft_id") REFERENCES "public"."checkout_payment_attempt"("id","draft_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "wishlist_item" ADD CONSTRAINT "wishlist_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "wishlist_item" ADD CONSTRAINT "wishlist_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_badge" ADD CONSTRAINT "lms_badge_icon_file_id_file_id_fk" FOREIGN KEY ("icon_file_id") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_bookmark" ADD CONSTRAINT "lms_bookmark_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_bookmark" ADD CONSTRAINT "lms_bookmark_lesson_id_lms_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lms_lesson"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_certificate" ADD CONSTRAINT "lms_certificate_enrollment_id_lms_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."lms_enrollment"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_certificate" ADD CONSTRAINT "lms_certificate_template_id_lms_certificate_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."lms_certificate_template"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_certificate_template" ADD CONSTRAINT "lms_certificate_template_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_content_block" ADD CONSTRAINT "lms_content_block_lesson_id_lms_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lms_lesson"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_content_block" ADD CONSTRAINT "lms_content_block_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_course" ADD CONSTRAINT "lms_course_instructor_id_user_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_course" ADD CONSTRAINT "lms_course_thumbnail_file_id_file_id_fk" FOREIGN KEY ("thumbnail_file_id") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_course" ADD CONSTRAINT "lms_course_program_id_lms_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."lms_program"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_course_prerequisite" ADD CONSTRAINT "lms_course_prerequisite_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_course_prerequisite" ADD CONSTRAINT "lms_course_prerequisite_prerequisite_course_id_lms_course_id_fk" FOREIGN KEY ("prerequisite_course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_course_product" ADD CONSTRAINT "lms_course_product_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_course_product" ADD CONSTRAINT "lms_course_product_product_category_id_product_category_id_fk" FOREIGN KEY ("product_category_id") REFERENCES "public"."product_category"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_course_review" ADD CONSTRAINT "lms_course_review_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_course_review" ADD CONSTRAINT "lms_course_review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_course_to_category" ADD CONSTRAINT "lms_course_to_category_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_course_to_category" ADD CONSTRAINT "lms_course_to_category_category_id_lms_course_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."lms_course_category"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_course_to_tag" ADD CONSTRAINT "lms_course_to_tag_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_course_to_tag" ADD CONSTRAINT "lms_course_to_tag_tag_id_lms_course_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."lms_course_tag"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_discussion_reply" ADD CONSTRAINT "lms_discussion_reply_thread_id_lms_discussion_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."lms_discussion_thread"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_discussion_reply" ADD CONSTRAINT "lms_discussion_reply_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_discussion_thread" ADD CONSTRAINT "lms_discussion_thread_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_discussion_thread" ADD CONSTRAINT "lms_discussion_thread_lesson_id_lms_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lms_lesson"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_discussion_thread" ADD CONSTRAINT "lms_discussion_thread_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_enrollment" ADD CONSTRAINT "lms_enrollment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_enrollment" ADD CONSTRAINT "lms_enrollment_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_learner_badge" ADD CONSTRAINT "lms_learner_badge_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_learner_badge" ADD CONSTRAINT "lms_learner_badge_badge_id_lms_badge_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."lms_badge"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_lesson" ADD CONSTRAINT "lms_lesson_module_id_lms_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."lms_module"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_module" ADD CONSTRAINT "lms_module_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_note" ADD CONSTRAINT "lms_note_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_note" ADD CONSTRAINT "lms_note_lesson_id_lms_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lms_lesson"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_progress" ADD CONSTRAINT "lms_progress_enrollment_id_lms_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."lms_enrollment"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_progress" ADD CONSTRAINT "lms_progress_content_block_id_lms_content_block_id_fk" FOREIGN KEY ("content_block_id") REFERENCES "public"."lms_content_block"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_progress" ADD CONSTRAINT "lms_progress_lesson_id_lms_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lms_lesson"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_progress" ADD CONSTRAINT "lms_progress_module_id_lms_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."lms_module"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_question" ADD CONSTRAINT "lms_question_bank_id_lms_question_bank_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."lms_question_bank"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_question_bank" ADD CONSTRAINT "lms_question_bank_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_question_option" ADD CONSTRAINT "lms_question_option_question_id_lms_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."lms_question"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_quiz" ADD CONSTRAINT "lms_quiz_lesson_id_lms_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lms_lesson"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_quiz" ADD CONSTRAINT "lms_quiz_module_id_lms_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."lms_module"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_quiz" ADD CONSTRAINT "lms_quiz_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_quiz_answer" ADD CONSTRAINT "lms_quiz_answer_attempt_id_lms_quiz_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."lms_quiz_attempt"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_quiz_answer" ADD CONSTRAINT "lms_quiz_answer_question_id_lms_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."lms_question"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_quiz_answer" ADD CONSTRAINT "lms_quiz_answer_graded_by_user_id_fk" FOREIGN KEY ("graded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "lms_quiz_attempt" ADD CONSTRAINT "lms_quiz_attempt_quiz_id_lms_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."lms_quiz"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lms_quiz_attempt" ADD CONSTRAINT "lms_quiz_attempt_enrollment_id_lms_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."lms_enrollment"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "account_locks_user_idx" ON "account_locks" USING btree ("user_id");
CREATE INDEX "account_locks_token_idx" ON "account_locks" USING btree ("unlock_token");
CREATE UNIQUE INDEX "affiliate_code_idx" ON "affiliate" USING btree ("affiliate_code");
CREATE UNIQUE INDEX "affiliate_user_idx" ON "affiliate" USING btree ("user_id");
CREATE INDEX "affiliate_status_idx" ON "affiliate" USING btree ("status");
CREATE UNIQUE INDEX "affiliate_attribution_capability_hash_idx" ON "affiliate_attribution" USING btree ("capability_hash");
CREATE INDEX "affiliate_attribution_link_idx" ON "affiliate_attribution" USING btree ("affiliate_link_id");
CREATE INDEX "affiliate_attribution_client_expires_idx" ON "affiliate_attribution" USING btree ("client_hash","expires_at");
CREATE INDEX "affiliate_attribution_expires_idx" ON "affiliate_attribution" USING btree ("expires_at");
CREATE INDEX "affiliate_attribution_consumed_idx" ON "affiliate_attribution" USING btree ("consumed_at");
CREATE INDEX "affiliate_attribution_click_link_date_idx" ON "affiliate_attribution_click" USING btree ("affiliate_link_id","clicked_at");
CREATE INDEX "affiliate_attribution_click_client_date_idx" ON "affiliate_attribution_click" USING btree ("client_hash","clicked_at");
CREATE INDEX "affiliate_attribution_click_attribution_idx" ON "affiliate_attribution_click" USING btree ("affiliate_attribution_id");
CREATE INDEX "affiliate_click_link_idx" ON "affiliate_click" USING btree ("affiliate_link_id");
CREATE INDEX "affiliate_click_session_idx" ON "affiliate_click" USING btree ("session_id");
CREATE INDEX "affiliate_click_date_idx" ON "affiliate_click" USING btree ("clicked_at");
CREATE UNIQUE INDEX "affiliate_click_dedupe_link_client_idx" ON "affiliate_click_dedupe" USING btree ("affiliate_link_id","client_hash");
CREATE INDEX "affiliate_click_dedupe_last_clicked_idx" ON "affiliate_click_dedupe" USING btree ("last_clicked_at");
CREATE UNIQUE INDEX "affiliate_commission_ledger_source_order_idx" ON "affiliate_commission_ledger" USING btree ("source_order_id");
CREATE UNIQUE INDEX "affiliate_commission_ledger_source_draft_idx" ON "affiliate_commission_ledger" USING btree ("source_checkout_draft_id");
CREATE UNIQUE INDEX "affiliate_commission_ledger_source_reference_idx" ON "affiliate_commission_ledger" USING btree ("source_reference");
CREATE INDEX "affiliate_commission_ledger_affiliate_created_idx" ON "affiliate_commission_ledger" USING btree ("affiliate_id","created_at");
CREATE INDEX "affiliate_commission_ledger_link_created_idx" ON "affiliate_commission_ledger" USING btree ("affiliate_link_id","created_at");
CREATE UNIQUE INDEX "affiliate_commission_ledger_event_reference_idx" ON "affiliate_commission_ledger_event" USING btree ("event_reference");
CREATE UNIQUE INDEX "affiliate_commission_ledger_event_single_lifecycle_idx" ON "affiliate_commission_ledger_event" USING btree ("commission_id","event_type") WHERE "affiliate_commission_ledger_event"."event_type" IN ('pending', 'approved', 'payable', 'paid');
CREATE INDEX "affiliate_commission_ledger_event_commission_created_idx" ON "affiliate_commission_ledger_event" USING btree ("commission_id","created_at");
CREATE INDEX "affiliate_commission_ledger_event_payout_created_idx" ON "affiliate_commission_ledger_event" USING btree ("payout_id","created_at");
CREATE UNIQUE INDEX "affiliate_link_code_idx" ON "affiliate_link" USING btree ("link_code");
CREATE INDEX "affiliate_link_affiliate_idx" ON "affiliate_link" USING btree ("affiliate_id");
CREATE INDEX "affiliate_link_product_idx" ON "affiliate_link" USING btree ("product_id");
CREATE UNIQUE INDEX "affiliate_payout_reference_idx" ON "affiliate_payout" USING btree ("payout_reference");
CREATE INDEX "affiliate_payout_affiliate_created_idx" ON "affiliate_payout" USING btree ("affiliate_id","created_at");
CREATE UNIQUE INDEX "affiliate_terms_acceptance_reference_idx" ON "affiliate_terms_acceptance" USING btree ("acceptance_reference");
CREATE UNIQUE INDEX "affiliate_terms_acceptance_version_idx" ON "affiliate_terms_acceptance" USING btree ("affiliate_id","terms_version","disclosure_version");
CREATE INDEX "affiliate_terms_acceptance_affiliate_accepted_idx" ON "affiliate_terms_acceptance" USING btree ("affiliate_id","accepted_at");
CREATE UNIQUE INDEX "affiliate_tier_code_version_idx" ON "affiliate_tier" USING btree ("code","version");
CREATE INDEX "affiliate_tier_active_idx" ON "affiliate_tier" USING btree ("is_active");
CREATE UNIQUE INDEX "cart_user_id_unique" ON "cart" USING btree ("user_id") WHERE "cart"."user_id" IS NOT NULL;
CREATE UNIQUE INDEX "cart_session_id_unique" ON "cart" USING btree ("session_id") WHERE "cart"."session_id" IS NOT NULL;
CREATE UNIQUE INDEX "catalog_seed_category_category_idx" ON "catalog_seed_category" USING btree ("category_id");
CREATE INDEX "catalog_seed_category_retired_idx" ON "catalog_seed_category" USING btree ("is_retired");
CREATE UNIQUE INDEX "catalog_seed_collection_category_idx" ON "catalog_seed_collection" USING btree ("category_id");
CREATE INDEX "catalog_seed_collection_retired_idx" ON "catalog_seed_collection" USING btree ("is_retired");
CREATE UNIQUE INDEX "catalog_seed_item_product_idx" ON "catalog_seed_item" USING btree ("product_id");
CREATE INDEX "catalog_seed_item_retired_idx" ON "catalog_seed_item" USING btree ("is_retired");
CREATE INDEX "catalog_seed_run_created_idx" ON "catalog_seed_run" USING btree ("created_at");
CREATE INDEX "catalog_seed_run_manifest_idx" ON "catalog_seed_run" USING btree ("manifest_hash","completed_at");
CREATE UNIQUE INDEX "checkout_draft_reference_idx" ON "checkout_draft" USING btree ("reference");
CREATE INDEX "checkout_draft_user_status_idx" ON "checkout_draft" USING btree ("user_id","status");
CREATE INDEX "checkout_draft_guest_status_idx" ON "checkout_draft" USING btree ("guest_subject_hash","status");
CREATE INDEX "checkout_draft_expires_idx" ON "checkout_draft" USING btree ("expires_at");
CREATE UNIQUE INDEX "checkout_draft_active_source_cart_idx" ON "checkout_draft" USING btree ("source_cart_id") WHERE "checkout_draft"."source_cart_id" IS NOT NULL AND "checkout_draft"."status" IN ('pending_session', 'checkout_created', 'quarantined', 'paid');
CREATE INDEX "checkout_draft_item_draft_idx" ON "checkout_draft_item" USING btree ("draft_id");
CREATE UNIQUE INDEX "checkout_draft_item_product_idx" ON "checkout_draft_item" USING btree ("draft_id","product_id");
CREATE UNIQUE INDEX "checkout_inventory_reservation_draft_product_idx" ON "checkout_inventory_reservation" USING btree ("draft_id","product_id");
CREATE INDEX "checkout_inventory_reservation_status_idx" ON "checkout_inventory_reservation" USING btree ("status");
CREATE UNIQUE INDEX "checkout_payment_attempt_draft_attempt_idx" ON "checkout_payment_attempt" USING btree ("draft_id","attempt_number");
CREATE UNIQUE INDEX "checkout_payment_attempt_id_draft_unique" ON "checkout_payment_attempt" USING btree ("id","draft_id");
CREATE INDEX "checkout_payment_attempt_draft_idx" ON "checkout_payment_attempt" USING btree ("draft_id");
CREATE UNIQUE INDEX "checkout_payment_attempt_active_draft_idx" ON "checkout_payment_attempt" USING btree ("draft_id") WHERE "checkout_payment_attempt"."status" IN ('pending_session', 'checkout_created', 'quarantined', 'paid');
CREATE UNIQUE INDEX "checkout_payment_attempt_stripe_session_idx" ON "checkout_payment_attempt" USING btree ("stripe_session_id");
CREATE UNIQUE INDEX "checkout_payment_attempt_payment_intent_idx" ON "checkout_payment_attempt" USING btree ("stripe_payment_intent_id");
CREATE UNIQUE INDEX "cms_content_slug_idx" ON "cms_content" USING btree ("slug");
CREATE INDEX "cms_content_status_idx" ON "cms_content" USING btree ("status");
CREATE INDEX "cms_content_author_idx" ON "cms_content" USING btree ("author_id");
CREATE UNIQUE INDEX "cms_seo_page_id_idx" ON "cms_seo_fields" USING btree ("page_id");
CREATE UNIQUE INDEX "content_page_slug_idx" ON "content_page" USING btree ("slug");
CREATE INDEX "content_page_type_idx" ON "content_page" USING btree ("type");
CREATE INDEX "content_page_status_idx" ON "content_page" USING btree ("status");
CREATE INDEX "content_page_author_idx" ON "content_page" USING btree ("author_id");
CREATE INDEX "content_page_published_idx" ON "content_page" USING btree ("published_at");
CREATE UNIQUE INDEX "email_change_capability_new_token_idx" ON "email_change_capability" USING btree ("new_email_token_hash");
CREATE UNIQUE INDEX "email_change_capability_previous_token_idx" ON "email_change_capability" USING btree ("previous_email_token_hash");
CREATE INDEX "email_change_capability_expires_idx" ON "email_change_capability" USING btree ("expires_at");
CREATE UNIQUE INDEX "email_verification_token_user_idx" ON "email_verification_token" USING btree ("user_id");
CREATE INDEX "email_verification_token_expires_idx" ON "email_verification_token" USING btree ("expires_at");
CREATE UNIQUE INDEX "file_bucket_path_idx" ON "file" USING btree ("bucket_path");
CREATE INDEX "file_entity_idx" ON "file" USING btree ("entity_type","entity_id");
CREATE INDEX "file_uploaded_by_idx" ON "file" USING btree ("uploaded_by");
CREATE INDEX "file_created_idx" ON "file" USING btree ("created_at");
CREATE INDEX "guest_order_access_grant_draft_idx" ON "guest_order_access_grant" USING btree ("draft_id");
CREATE INDEX "guest_order_access_grant_expires_idx" ON "guest_order_access_grant" USING btree ("expires_at");
CREATE UNIQUE INDEX "login_attempts_identifier_idx" ON "login_attempts" USING btree ("identifier","identifier_type");
CREATE INDEX "login_attempts_blocked_idx" ON "login_attempts" USING btree ("blocked_until");
CREATE INDEX "notification_user_read_idx" ON "notification" USING btree ("user_id","is_read");
CREATE INDEX "notification_created_idx" ON "notification" USING btree ("created_at");
CREATE UNIQUE INDEX "order_number_idx" ON "order" USING btree ("order_number");
CREATE INDEX "order_user_idx" ON "order" USING btree ("user_id");
CREATE INDEX "order_status_idx" ON "order" USING btree ("status");
CREATE INDEX "order_affiliate_idx" ON "order" USING btree ("affiliate_link_id");
CREATE INDEX "order_date_idx" ON "order" USING btree ("created_at");
CREATE UNIQUE INDEX "order_checkout_draft_id_unique" ON "order" USING btree ("checkout_draft_id") WHERE "order"."checkout_draft_id" IS NOT NULL;
CREATE UNIQUE INDEX "order_stripe_session_idx" ON "order" USING btree ("stripe_session_id") WHERE "order"."stripe_session_id" IS NOT NULL;
CREATE UNIQUE INDEX "order_stripe_payment_intent_idx" ON "order" USING btree ("stripe_payment_intent_id") WHERE "order"."stripe_payment_intent_id" IS NOT NULL;
CREATE UNIQUE INDEX "password_reset_token_user_idx" ON "password_reset_token" USING btree ("user_id");
CREATE INDEX "password_reset_token_expires_idx" ON "password_reset_token" USING btree ("expires_at");
CREATE INDEX "product_name_idx" ON "product" USING btree ("name");
CREATE INDEX "product_sku_idx" ON "product" USING btree ("sku");
CREATE INDEX "product_category_idx" ON "product" USING btree ("category_id");
CREATE INDEX "product_active_idx" ON "product" USING btree ("is_active");
CREATE INDEX "product_featured_idx" ON "product" USING btree ("is_featured");
CREATE INDEX "product_review_product_idx" ON "product_review" USING btree ("product_id");
CREATE INDEX "seller_application_email_idx" ON "seller_application" USING btree ("email");
CREATE INDEX "seller_application_created_at_idx" ON "seller_application" USING btree ("created_at");
CREATE INDEX "social_accounts_user_idx" ON "social_accounts" USING btree ("user_id");
CREATE UNIQUE INDEX "social_accounts_provider_idx" ON "social_accounts" USING btree ("provider","provider_user_id");
CREATE INDEX "stripe_webhook_event_draft_idx" ON "stripe_webhook_event" USING btree ("draft_id");
CREATE INDEX "stripe_webhook_event_attempt_idx" ON "stripe_webhook_event" USING btree ("payment_attempt_id");
CREATE INDEX "stripe_webhook_event_status_idx" ON "stripe_webhook_event" USING btree ("status");
CREATE UNIQUE INDEX "user_pending_email_unique" ON "user" USING btree ("pending_email");
CREATE INDEX "wishlist_item_user_idx" ON "wishlist_item" USING btree ("user_id");
CREATE UNIQUE INDEX "wishlist_item_unique_idx" ON "wishlist_item" USING btree ("user_id","product_id");
CREATE INDEX "lms_badge_trigger_type_idx" ON "lms_badge" USING btree ("trigger_type");
CREATE INDEX "lms_bookmark_user_idx" ON "lms_bookmark" USING btree ("user_id");
CREATE UNIQUE INDEX "lms_bookmark_user_lesson_idx" ON "lms_bookmark" USING btree ("user_id","lesson_id");
CREATE INDEX "lms_certificate_enrollment_idx" ON "lms_certificate" USING btree ("enrollment_id");
CREATE INDEX "lms_certificate_uid_idx" ON "lms_certificate" USING btree ("certificate_uid");
CREATE INDEX "lms_certificate_template_course_idx" ON "lms_certificate_template" USING btree ("course_id");
CREATE INDEX "lms_content_block_lesson_idx" ON "lms_content_block" USING btree ("lesson_id");
CREATE INDEX "lms_content_block_lesson_order_idx" ON "lms_content_block" USING btree ("lesson_id","sort_order");
CREATE INDEX "lms_content_block_type_idx" ON "lms_content_block" USING btree ("type");
CREATE INDEX "lms_course_slug_idx" ON "lms_course" USING btree ("slug");
CREATE INDEX "lms_course_status_idx" ON "lms_course" USING btree ("status");
CREATE INDEX "lms_course_instructor_idx" ON "lms_course" USING btree ("instructor_id");
CREATE INDEX "lms_course_program_idx" ON "lms_course" USING btree ("program_id");
CREATE INDEX "lms_course_status_featured_idx" ON "lms_course" USING btree ("status","is_featured");
CREATE INDEX "lms_course_category_slug_idx" ON "lms_course_category" USING btree ("slug");
CREATE INDEX "lms_course_product_course_idx" ON "lms_course_product" USING btree ("course_id");
CREATE INDEX "lms_course_product_category_idx" ON "lms_course_product" USING btree ("product_category_id");
CREATE UNIQUE INDEX "lms_course_product_unique_idx" ON "lms_course_product" USING btree ("course_id","product_category_id");
CREATE INDEX "lms_course_review_course_idx" ON "lms_course_review" USING btree ("course_id");
CREATE INDEX "lms_course_review_user_idx" ON "lms_course_review" USING btree ("user_id");
CREATE INDEX "lms_course_review_status_idx" ON "lms_course_review" USING btree ("status");
CREATE UNIQUE INDEX "lms_course_review_course_user_idx" ON "lms_course_review" USING btree ("course_id","user_id");
CREATE INDEX "lms_course_tag_slug_idx" ON "lms_course_tag" USING btree ("slug");
CREATE INDEX "lms_discussion_reply_thread_idx" ON "lms_discussion_reply" USING btree ("thread_id");
CREATE INDEX "lms_discussion_reply_user_idx" ON "lms_discussion_reply" USING btree ("user_id");
CREATE INDEX "lms_discussion_reply_parent_idx" ON "lms_discussion_reply" USING btree ("parent_reply_id");
CREATE INDEX "lms_discussion_thread_course_idx" ON "lms_discussion_thread" USING btree ("course_id");
CREATE INDEX "lms_discussion_thread_lesson_idx" ON "lms_discussion_thread" USING btree ("lesson_id");
CREATE INDEX "lms_discussion_thread_user_idx" ON "lms_discussion_thread" USING btree ("user_id");
CREATE INDEX "lms_discussion_thread_course_pinned_idx" ON "lms_discussion_thread" USING btree ("course_id","is_pinned");
CREATE INDEX "lms_enrollment_user_idx" ON "lms_enrollment" USING btree ("user_id");
CREATE INDEX "lms_enrollment_course_idx" ON "lms_enrollment" USING btree ("course_id");
CREATE INDEX "lms_enrollment_status_idx" ON "lms_enrollment" USING btree ("status");
CREATE UNIQUE INDEX "lms_enrollment_user_course_idx" ON "lms_enrollment" USING btree ("user_id","course_id");
CREATE INDEX "lms_learner_badge_user_idx" ON "lms_learner_badge" USING btree ("user_id");
CREATE INDEX "lms_learner_badge_badge_idx" ON "lms_learner_badge" USING btree ("badge_id");
CREATE UNIQUE INDEX "lms_learner_badge_user_badge_idx" ON "lms_learner_badge" USING btree ("user_id","badge_id");
CREATE INDEX "lms_lesson_module_idx" ON "lms_lesson" USING btree ("module_id");
CREATE INDEX "lms_lesson_module_order_idx" ON "lms_lesson" USING btree ("module_id","sort_order");
CREATE INDEX "lms_module_course_idx" ON "lms_module" USING btree ("course_id");
CREATE INDEX "lms_module_course_order_idx" ON "lms_module" USING btree ("course_id","sort_order");
CREATE INDEX "lms_note_user_idx" ON "lms_note" USING btree ("user_id");
CREATE INDEX "lms_note_user_lesson_idx" ON "lms_note" USING btree ("user_id","lesson_id");
CREATE INDEX "lms_program_slug_idx" ON "lms_program" USING btree ("slug");
CREATE INDEX "lms_progress_enrollment_idx" ON "lms_progress" USING btree ("enrollment_id");
CREATE INDEX "lms_progress_enrollment_content_idx" ON "lms_progress" USING btree ("enrollment_id","content_block_id");
CREATE INDEX "lms_progress_enrollment_lesson_idx" ON "lms_progress" USING btree ("enrollment_id","lesson_id");
CREATE UNIQUE INDEX "lms_progress_enrollment_content_unique_idx" ON "lms_progress" USING btree ("enrollment_id","content_block_id");
CREATE INDEX "lms_question_bank_idx" ON "lms_question" USING btree ("bank_id");
CREATE INDEX "lms_question_type_idx" ON "lms_question" USING btree ("type");
CREATE INDEX "lms_question_bank_course_idx" ON "lms_question_bank" USING btree ("course_id");
CREATE INDEX "lms_question_option_question_idx" ON "lms_question_option" USING btree ("question_id");
CREATE INDEX "lms_quiz_lesson_idx" ON "lms_quiz" USING btree ("lesson_id");
CREATE INDEX "lms_quiz_module_idx" ON "lms_quiz" USING btree ("module_id");
CREATE INDEX "lms_quiz_course_idx" ON "lms_quiz" USING btree ("course_id");
CREATE INDEX "lms_quiz_answer_attempt_idx" ON "lms_quiz_answer" USING btree ("attempt_id");
CREATE INDEX "lms_quiz_answer_question_idx" ON "lms_quiz_answer" USING btree ("question_id");
CREATE UNIQUE INDEX "lms_quiz_answer_attempt_question_idx" ON "lms_quiz_answer" USING btree ("attempt_id","question_id");
CREATE INDEX "lms_quiz_attempt_quiz_idx" ON "lms_quiz_attempt" USING btree ("quiz_id");
CREATE INDEX "lms_quiz_attempt_enrollment_idx" ON "lms_quiz_attempt" USING btree ("enrollment_id");
CREATE INDEX "lms_quiz_attempt_quiz_enrollment_idx" ON "lms_quiz_attempt" USING btree ("quiz_id","enrollment_id");
