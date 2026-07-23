-- Read-only inspection for 0009_catalog_enrichment.sql. Zero exit status is not approval.

BEGIN READ ONLY;

SELECT current_database() AS database_name, current_user AS database_user, now() AS inspected_at;

SELECT c.oid::regclass AS relation_name
FROM pg_class AS c
WHERE c.oid = ANY (ARRAY[
	to_regclass('public.product_category'),
	to_regclass('public.product'),
	to_regclass('public.product_image'),
	to_regclass('public.file'),
	to_regclass('public.content_page'),
	to_regclass('public.product_catalog_profile'),
	to_regclass('public.product_category_assignment'),
	to_regclass('public.catalog_tag'),
	to_regclass('public.product_tag'),
	to_regclass('public.catalog_manufacturer'),
	to_regclass('public.product_manufacturer'),
	to_regclass('public.catalog_content_area'),
	to_regclass('public.product_content_area'),
	to_regclass('public.catalog_attribute'),
	to_regclass('public.catalog_attribute_option'),
	to_regclass('public.product_attribute_value'),
	to_regclass('public.content_tag'),
	to_regclass('public.content_page_area'),
	to_regclass('public.product_content_link'),
	to_regclass('public.catalog_media_asset'),
	to_regclass('public.product_media_assignment'),
	to_regclass('public.catalog_enrichment_run')
])
ORDER BY relation_name;

SELECT slug, count(*) AS duplicate_count
FROM product_category
GROUP BY lower(slug)
HAVING count(*) > 1;

SELECT id, slug, tags
FROM product
WHERE tags IS NOT NULL AND NOT pg_input_is_valid(tags, 'jsonb')
ORDER BY id;

SELECT id, slug, tags
FROM content_page
WHERE tags IS NOT NULL AND NOT pg_input_is_valid(tags, 'jsonb')
ORDER BY id;

SELECT product_id, count(*) AS primary_image_count
FROM product_image
WHERE is_main
GROUP BY product_id
HAVING count(*) > 1;

SELECT image.id, image.product_id, image.file_id
FROM product_image AS image
LEFT JOIN file ON file.id = image.file_id
WHERE file.id IS NULL
ORDER BY image.id;

WITH RECURSIVE walk AS (
	SELECT id, parent_id, ARRAY[id] AS path, false AS cycle FROM product_category
	UNION ALL
	SELECT parent.id, parent.parent_id, walk.path || parent.id, parent.id = ANY(walk.path)
	FROM walk
	INNER JOIN product_category AS parent ON parent.id = walk.parent_id
	WHERE NOT walk.cycle
)
SELECT id, path
FROM walk
WHERE cycle;

SELECT
	(SELECT count(*) FROM product) AS products,
	(SELECT count(*) FROM product_category) AS categories,
	(SELECT count(*) FROM product_image) AS product_images,
	(SELECT count(*) FROM file WHERE entity_type = 'product') AS product_files,
	(SELECT count(*) FROM content_page) AS content_pages,
	(SELECT count(*) FROM product WHERE tags IS NOT NULL) AS tagged_products,
	(SELECT count(*) FROM content_page WHERE tags IS NOT NULL) AS tagged_content_pages;

SELECT n.nspname AS migration_schema,
	c.oid::regclass AS migration_tracker,
	array_agg(a.attname ORDER BY a.attnum) FILTER (WHERE a.attnum > 0 AND NOT a.attisdropped) AS columns
FROM pg_class AS c
INNER JOIN pg_namespace AS n ON n.oid = c.relnamespace
LEFT JOIN pg_attribute AS a ON a.attrelid = c.oid
WHERE c.relname = '__drizzle_migrations'
GROUP BY n.nspname, c.oid;

ROLLBACK;
