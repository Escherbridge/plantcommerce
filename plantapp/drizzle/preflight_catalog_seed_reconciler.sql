-- Read-only target inspection for 0008_catalog_seed_reconciler.sql. Do not mutate the target database.

BEGIN READ ONLY;

SELECT current_database() AS database_name, current_user AS database_user, now() AS inspected_at;

SELECT c.oid::regclass AS relation_name
FROM pg_class AS c
WHERE c.oid = ANY (ARRAY[
	to_regclass('public.product_category'),
	to_regclass('public.product'),
	to_regclass('public.file'),
	to_regclass('public.product_image'),
	to_regclass('public.catalog_seed_category'),
	to_regclass('public.catalog_seed_collection'),
	to_regclass('public.catalog_seed_item'),
	to_regclass('public.catalog_seed_run')
])
ORDER BY relation_name;

SELECT c.relname AS table_name,
	a.attname AS column_name,
	pg_catalog.format_type(a.atttypid, a.atttypmod) AS column_type,
	a.attnotnull AS not_null
FROM pg_class AS c
INNER JOIN pg_namespace AS n ON n.oid = c.relnamespace
INNER JOIN pg_attribute AS a ON a.attrelid = c.oid
WHERE n.nspname = 'public'
	AND c.relname IN ('product_category', 'product', 'file', 'product_image', 'catalog_seed_category', 'catalog_seed_collection', 'catalog_seed_item', 'catalog_seed_run')
	AND a.attnum > 0
	AND NOT a.attisdropped
ORDER BY c.relname, a.attnum;

SELECT conrelid::regclass AS table_name,
	conname AS constraint_name,
	contype AS constraint_type,
	pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = ANY (ARRAY[
	to_regclass('public.product_category'),
	to_regclass('public.product'),
	to_regclass('public.file'),
	to_regclass('public.product_image'),
	to_regclass('public.catalog_seed_category'),
	to_regclass('public.catalog_seed_collection'),
	to_regclass('public.catalog_seed_item'),
	to_regclass('public.catalog_seed_run')
])
ORDER BY table_name, constraint_name;

SELECT tablename AS table_name, indexname AS index_name, indexdef AS index_definition
FROM pg_indexes
WHERE schemaname = 'public'
	AND tablename IN ('product_category', 'product', 'file', 'product_image', 'catalog_seed_category', 'catalog_seed_collection', 'catalog_seed_item', 'catalog_seed_run')
ORDER BY tablename, indexname;

SELECT slug, count(*) AS duplicate_count FROM product_category GROUP BY slug HAVING count(*) > 1;
SELECT slug, count(*) AS duplicate_count FROM product GROUP BY slug HAVING count(*) > 1;
SELECT sku, count(*) AS duplicate_count FROM product GROUP BY sku HAVING count(*) > 1;
SELECT bucket_path, count(*) AS duplicate_count FROM file GROUP BY bucket_path HAVING count(*) > 1;

SELECT image.id, image.product_id, image.file_id
FROM product_image AS image
LEFT JOIN file ON file.id = image.file_id
WHERE file.id IS NULL
ORDER BY image.id;

SELECT product_id, count(*) AS primary_image_count
FROM product_image
WHERE is_main
GROUP BY product_id
HAVING count(*) > 1;

SELECT id, slug, sku, price, stock_quantity, reserved_quantity
FROM product
WHERE price < 0 OR stock_quantity < 0 OR reserved_quantity < 0
ORDER BY id;

SELECT n.nspname AS migration_schema,
	c.oid::regclass AS migration_tracker,
	array_agg(a.attname ORDER BY a.attnum) FILTER (WHERE a.attnum > 0 AND NOT a.attisdropped) AS columns
FROM pg_class AS c
INNER JOIN pg_namespace AS n ON n.oid = c.relnamespace
LEFT JOIN pg_attribute AS a ON a.attrelid = c.oid
WHERE c.relname = '__drizzle_migrations'
GROUP BY n.nspname, c.oid;

ROLLBACK;
