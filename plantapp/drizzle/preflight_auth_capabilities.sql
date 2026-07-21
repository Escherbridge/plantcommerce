-- Read-only target preflight for 0004_auth_capabilities.sql. Do not mutate the target database.
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

SELECT to_regclass('public.user') AS user_table,
	to_regclass('public.email_verification_token') AS email_verification_token_table,
	to_regclass('public.email_change_capability') AS email_change_capability_table,
	to_regclass('public.login_attempts') AS login_attempts_table,
	to_regclass('public.password_reset_token') AS password_reset_token_table;

SELECT c.relname AS table_name,
	a.attname AS column_name,
	pg_catalog.format_type(a.atttypid, a.atttypmod) AS column_type,
	a.attnotnull AS not_null
FROM pg_class c
INNER JOIN pg_namespace n ON n.oid = c.relnamespace
INNER JOIN pg_attribute a ON a.attrelid = c.oid
WHERE n.nspname = 'public'
	AND c.relname IN ('user', 'email_verification_token', 'email_change_capability', 'login_attempts', 'password_reset_token')
	AND a.attnum > 0
	AND NOT a.attisdropped
ORDER BY c.relname, a.attnum;

SELECT indexrelid::regclass AS index_name,
	indrelid::regclass AS table_name,
	pg_get_indexdef(indexrelid) AS definition
FROM pg_index
WHERE indrelid = ANY (ARRAY[
	to_regclass('public.email_verification_token'),
	to_regclass('public.email_change_capability'),
	to_regclass('public.login_attempts'),
	to_regclass('public.password_reset_token')
]);

SELECT identifier, identifier_type, count(*) AS duplicate_count
FROM "public"."login_attempts"
GROUP BY identifier, identifier_type
HAVING count(*) > 1;

SELECT username_owner.id AS username_owner_id,
	username_owner.username,
	email_owner.id AS email_owner_id,
	email_owner.email
FROM "public"."user" AS username_owner
INNER JOIN "public"."user" AS email_owner
	ON lower(btrim(username_owner.username)) = lower(btrim(email_owner.email))
	AND username_owner.id <> email_owner.id;

SELECT lower(btrim(email)) AS normalized_email, count(*) AS duplicate_count
FROM "public"."user"
GROUP BY lower(btrim(email))
HAVING count(*) > 1;

SELECT lower(btrim(to_jsonb(user_row) ->> 'pending_email')) AS normalized_pending_email, count(*) AS duplicate_count
FROM "public"."user" AS user_row
WHERE to_jsonb(user_row) ->> 'pending_email' IS NOT NULL
GROUP BY lower(btrim(to_jsonb(user_row) ->> 'pending_email'))
HAVING count(*) > 1;

SELECT active_owner.id AS active_owner_id,
	active_owner.email AS active_email,
	pending_owner.id AS pending_owner_id,
	to_jsonb(pending_owner) ->> 'pending_email' AS pending_email
FROM "public"."user" AS active_owner
INNER JOIN "public"."user" AS pending_owner
	ON lower(btrim(active_owner.email)) = lower(btrim(to_jsonb(pending_owner) ->> 'pending_email'))
	AND active_owner.id <> pending_owner.id;

SELECT id, username, email
FROM "public"."user"
WHERE username ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$';

ROLLBACK;
