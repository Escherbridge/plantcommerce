-- Read-only target inspection for 0007_affiliate_commission_ledger.sql. Do not mutate the target database.
BEGIN READ ONLY;

SELECT current_database() AS database_name, current_user AS database_user, now() AS inspected_at;

SELECT n.nspname AS migration_schema,
	c.oid::regclass AS migration_tracker,
	array_agg(a.attname ORDER BY a.attnum) FILTER (WHERE a.attnum > 0 AND NOT a.attisdropped) AS columns
FROM pg_class c
INNER JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_attribute a ON a.attrelid = c.oid
WHERE c.relname = '__drizzle_migrations'
GROUP BY n.nspname, c.oid;

DO $$
DECLARE
	migration_tracker regclass;
	migration_row jsonb;
BEGIN
	SELECT c.oid::regclass
	INTO migration_tracker
	FROM pg_class c
	WHERE c.relname = '__drizzle_migrations'
	ORDER BY c.oid
	LIMIT 1;

	IF migration_tracker IS NULL THEN
		RAISE NOTICE 'No __drizzle_migrations relation was found';
		RETURN;
	END IF;

	FOR migration_row IN EXECUTE format('SELECT to_jsonb(row_data) FROM %s AS row_data', migration_tracker)
	LOOP
		RAISE NOTICE 'drizzle_migration_row=%', migration_row;
	END LOOP;
END $$;

SELECT to_regclass('public.affiliate') AS affiliate_table,
	to_regclass('public.affiliate_link') AS affiliate_link_table,
	to_regclass('public.cart') AS cart_table,
	to_regclass('public.checkout_draft') AS checkout_draft_table,
	to_regclass('public.order') AS order_table,
	to_regclass('public.stripe_webhook_event') AS stripe_webhook_event_table,
	to_regclass('public.affiliate_attribution') AS affiliate_attribution_table,
	to_regclass('public.affiliate_tier') AS affiliate_tier_table,
	to_regclass('public.affiliate_terms_acceptance') AS affiliate_terms_acceptance_table,
	to_regclass('public.affiliate_payout') AS affiliate_payout_table,
	to_regclass('public.affiliate_commission_ledger') AS affiliate_commission_ledger_table,
	to_regclass('public.affiliate_commission_ledger_event') AS affiliate_commission_ledger_event_table,
	to_regclass('public.affiliate_user_idx') AS affiliate_user_index,
	to_regclass('public.cart_user_id_unique') AS cart_user_identity_index,
	to_regclass('public.cart_session_id_unique') AS cart_session_identity_index,
	to_regprocedure('public.prevent_checkout_draft_snapshot_mutation()') AS checkout_draft_snapshot_guard_function;

WITH required_checkout_draft_columns(column_name) AS (
	VALUES
		('affiliate_link_id'),
		('affiliate_commission_minor'),
		('snapshot_hash'),
		('affiliate_id'),
		('affiliate_commission_rate_bps'),
		('affiliate_tier_code'),
		('affiliate_tier_version'),
		('affiliate_terms_version'),
		('affiliate_disclosure_version'),
		('affiliate_terms_acceptance_id')
)
SELECT required_checkout_draft_columns.column_name,
	EXISTS (
		SELECT 1 FROM information_schema.columns AS c
		WHERE c.table_schema = 'public'
			AND c.table_name = 'checkout_draft'
			AND c.column_name = required_checkout_draft_columns.column_name
	) AS present
FROM required_checkout_draft_columns
ORDER BY required_checkout_draft_columns.column_name;

SELECT tgname AS trigger_name,
	pg_get_triggerdef(oid) AS definition
FROM pg_trigger
WHERE tgrelid = to_regclass('public.checkout_draft')
	AND NOT tgisinternal
ORDER BY tgname;

SELECT i.indexrelid::regclass AS index_name,
	pg_get_indexdef(i.indexrelid) AS definition,
	con.conname AS backing_constraint
FROM pg_index i
LEFT JOIN pg_constraint con ON con.conindid = i.indexrelid
WHERE i.indrelid = to_regclass('public.affiliate')
	AND i.indexrelid = to_regclass('public.affiliate_user_idx');

SELECT c.relname AS table_name,
	a.attname AS column_name,
	pg_catalog.format_type(a.atttypid, a.atttypmod) AS column_type,
	a.attnotnull AS not_null
FROM pg_class c
INNER JOIN pg_namespace n ON n.oid = c.relnamespace
INNER JOIN pg_attribute a ON a.attrelid = c.oid
WHERE n.nspname = 'public'
	AND c.relname IN (
		'affiliate',
		'affiliate_link',
		'cart',
		'checkout_draft',
		'order',
		'stripe_webhook_event',
		'affiliate_tier',
		'affiliate_terms_acceptance',
		'affiliate_payout',
		'affiliate_commission_ledger',
		'affiliate_commission_ledger_event'
	)
	AND a.attnum > 0
	AND NOT a.attisdropped
ORDER BY c.relname, a.attnum;

SELECT conrelid::regclass AS table_name,
	conname AS constraint_name,
	contype AS constraint_type,
	pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = ANY (ARRAY[
	to_regclass('public.affiliate'),
	to_regclass('public.affiliate_link'),
	to_regclass('public.cart'),
	to_regclass('public.checkout_draft'),
	to_regclass('public.order'),
	to_regclass('public.stripe_webhook_event'),
	to_regclass('public.affiliate_tier'),
	to_regclass('public.affiliate_terms_acceptance'),
	to_regclass('public.affiliate_payout'),
	to_regclass('public.affiliate_commission_ledger'),
	to_regclass('public.affiliate_commission_ledger_event')
])
ORDER BY table_name, constraint_name;

SELECT tablename AS table_name, indexname AS index_name, indexdef AS index_definition
FROM pg_indexes
WHERE schemaname = 'public'
	AND tablename IN (
		'affiliate',
		'affiliate_link',
		'cart',
		'checkout_draft',
		'order',
		'stripe_webhook_event',
		'affiliate_tier',
		'affiliate_terms_acceptance',
		'affiliate_payout',
		'affiliate_commission_ledger',
		'affiliate_commission_ledger_event'
	)
ORDER BY tablename, indexname;

SELECT user_id, count(*) AS duplicate_count
FROM affiliate
GROUP BY user_id
HAVING count(*) > 1;

SELECT link_code, count(*) AS duplicate_count
FROM affiliate_link
GROUP BY link_code
HAVING count(*) > 1;

SELECT id, user_id, session_id
FROM cart
WHERE (user_id IS NULL) = (session_id IS NULL)
ORDER BY id;

SELECT user_id, count(*) AS duplicate_count
FROM cart
WHERE user_id IS NOT NULL
GROUP BY user_id
HAVING count(*) > 1;

SELECT session_id, count(*) AS duplicate_count
FROM cart
WHERE session_id IS NOT NULL
GROUP BY session_id
HAVING count(*) > 1;

SELECT checkout_draft_id, count(*) AS duplicate_count
FROM "order"
WHERE checkout_draft_id IS NOT NULL
GROUP BY checkout_draft_id
HAVING count(*) > 1;

SELECT id, affiliate_link_id, status, expires_at
FROM checkout_draft
WHERE affiliate_link_id IS NOT NULL
	AND status IN ('pending_session', 'checkout_created', 'quarantined', 'paid')
ORDER BY created_at;

SELECT id, commission_rate
FROM affiliate
WHERE commission_rate < 0 OR commission_rate > 1
ORDER BY id;

ROLLBACK;
