-- Read-only target inspection for 0005_lms_quiz_integrity.sql. Do not mutate the target database.
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

SELECT to_regclass('public.lms_quiz_answer') AS lms_quiz_answer_table,
	to_regclass('public.lms_quiz_attempt') AS lms_quiz_attempt_table,
	to_regclass('public.file') AS file_table;

SELECT attempt_id, question_id, count(*) AS duplicate_count
FROM lms_quiz_answer
GROUP BY attempt_id, question_id
HAVING count(*) > 1;

SELECT tablename AS table_name, indexname AS index_name, indexdef AS index_definition
FROM pg_indexes
WHERE schemaname = 'public' AND tablename IN ('lms_quiz_answer', 'lms_quiz_attempt', 'file')
ORDER BY tablename, indexname;

ROLLBACK;
