-- Read-only target inspection for 0012_order_transfer_group.sql. Do not mutate the target database.
BEGIN READ ONLY;

SELECT current_database() AS database_name, current_user AS database_user, now() AS inspected_at;

SELECT to_regclass('public.order') AS order_table;

SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
	AND table_name = 'order'
	AND column_name IN ('stripe_charge_id', 'transfer_group', 'stripe_session_id', 'stripe_payment_intent_id')
ORDER BY column_name;

SELECT indexname AS index_name, indexdef AS index_definition
FROM pg_indexes
WHERE schemaname = 'public'
	AND tablename = 'order'
	AND indexname IN ('order_stripe_charge_id_unique', 'order_stripe_session_idx', 'order_stripe_payment_intent_idx')
ORDER BY indexname;

DO $$
DECLARE
	duplicate_row record;
BEGIN
	IF to_regclass('public.order') IS NULL THEN
		RAISE NOTICE 'order table is not present';
		RETURN;
	END IF;
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'order' AND column_name = 'stripe_charge_id'
	) THEN
		RAISE NOTICE 'stripe_charge_id is not present yet';
		RETURN;
	END IF;
	FOR duplicate_row IN EXECUTE
		'SELECT stripe_charge_id, count(*) AS duplicate_count FROM public.order WHERE stripe_charge_id IS NOT NULL GROUP BY stripe_charge_id HAVING count(*) > 1'
	LOOP
		RAISE NOTICE 'duplicate_stripe_charge=%', to_jsonb(duplicate_row);
	END LOOP;
END $$;

ROLLBACK;
