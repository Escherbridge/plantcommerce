-- Read-only target inspection for 0003_secure_checkout_drafts.sql.
-- Save this output with the release evidence. A nonempty secure-table result is a hard stop.

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

SELECT c.relname AS unexpected_secure_checkout_table, c.relkind
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
	]);

SELECT c.relname AS table_name,
	a.attname AS column_name,
	pg_catalog.format_type(a.atttypid, a.atttypmod) AS column_type,
	a.attnotnull AS not_null,
	pg_get_expr(ad.adbin, ad.adrelid) AS default_expression
FROM pg_class c
INNER JOIN pg_namespace n ON n.oid = c.relnamespace
INNER JOIN pg_attribute a ON a.attrelid = c.oid
LEFT JOIN pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
WHERE n.nspname = 'public'
	AND c.relname = ANY (ARRAY['order', 'product'])
	AND a.attnum > 0
	AND NOT a.attisdropped
	AND a.attname = ANY (ARRAY[
		'checkout_draft_id',
		'stripe_session_id',
		'stripe_payment_intent_id',
		'reserved_quantity'
	])
ORDER BY c.relname, a.attnum;

SELECT conrelid::regclass AS table_name,
	conname AS constraint_name,
	contype AS constraint_type,
	pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid IN ('order'::regclass, 'product'::regclass)
ORDER BY conrelid::regclass::text, conname;

SELECT tablename AS table_name, indexname AS index_name, indexdef AS index_definition
FROM pg_indexes
WHERE schemaname = 'public' AND tablename IN ('order', 'product')
ORDER BY tablename, indexname;

WITH legacy_order_values AS (
	SELECT to_jsonb(o) ->> 'stripe_session_id' AS stripe_session_id,
		to_jsonb(o) ->> 'stripe_payment_intent_id' AS stripe_payment_intent_id
	FROM "order" AS o
)
SELECT 'stripe_session_id' AS field, stripe_session_id AS duplicate_value, count(*) AS duplicate_count
FROM legacy_order_values
WHERE stripe_session_id IS NOT NULL
GROUP BY stripe_session_id
HAVING count(*) > 1
UNION ALL
SELECT 'stripe_payment_intent_id' AS field, stripe_payment_intent_id AS duplicate_value, count(*) AS duplicate_count
FROM legacy_order_values
WHERE stripe_payment_intent_id IS NOT NULL
GROUP BY stripe_payment_intent_id
HAVING count(*) > 1;

SELECT count(*) FILTER (WHERE COALESCE((to_jsonb(p) ->> 'reserved_quantity')::integer, 0) < 0) AS negative_reserved_quantity_rows,
	count(*) AS product_rows
FROM product AS p;

WITH fingerprint_parts AS (
	SELECT format('column:%s:%s:%s:%s', c.relname, a.attname,
		pg_catalog.format_type(a.atttypid, a.atttypmod), a.attnotnull) AS part
	FROM pg_class c
	INNER JOIN pg_namespace n ON n.oid = c.relnamespace
	INNER JOIN pg_attribute a ON a.attrelid = c.oid
	WHERE n.nspname = 'public'
		AND c.relname = ANY (ARRAY['order', 'product'])
		AND a.attnum > 0
		AND NOT a.attisdropped
	UNION ALL
	SELECT format('constraint:%s:%s', conrelid::regclass::text, pg_get_constraintdef(oid))
	FROM pg_constraint
	WHERE conrelid IN ('order'::regclass, 'product'::regclass)
	UNION ALL
	SELECT format('index:%s:%s', tablename, indexdef)
	FROM pg_indexes
	WHERE schemaname = 'public' AND tablename IN ('order', 'product')
)
SELECT md5(string_agg(part, E'\n' ORDER BY part)) AS legacy_checkout_schema_fingerprint
FROM fingerprint_parts;

ROLLBACK;
