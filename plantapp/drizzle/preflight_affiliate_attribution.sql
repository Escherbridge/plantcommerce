-- Read-only target inspection for 0006_affiliate_attribution.sql. Do not mutate the target database.
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
	to_regclass('public.user') AS user_table,
	to_regclass('public.affiliate_attribution') AS affiliate_attribution_table,
	to_regclass('public.affiliate_attribution_click') AS affiliate_attribution_click_table,
	to_regclass('public.affiliate_click_dedupe') AS affiliate_click_dedupe_table;

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
		'user',
		'affiliate_attribution',
		'affiliate_attribution_click',
		'affiliate_click_dedupe'
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
	to_regclass('public.user'),
	to_regclass('public.affiliate_attribution'),
	to_regclass('public.affiliate_attribution_click'),
	to_regclass('public.affiliate_click_dedupe')
])
ORDER BY table_name, constraint_name;

SELECT tablename AS table_name, indexname AS index_name, indexdef AS index_definition
FROM pg_indexes
WHERE schemaname = 'public'
	AND tablename IN (
		'affiliate',
		'affiliate_link',
		'user',
		'affiliate_attribution',
		'affiliate_attribution_click',
		'affiliate_click_dedupe'
	)
ORDER BY tablename, indexname;

SELECT link_code, count(*) AS duplicate_count
FROM affiliate_link
GROUP BY link_code
HAVING count(*) > 1;

ROLLBACK;
