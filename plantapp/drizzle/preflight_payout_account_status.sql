-- Read-only target inspection for 0015_payout_account_status.sql. Do not mutate the target database.
BEGIN READ ONLY;

SELECT current_database() AS database_name, current_user AS database_user, now() AS inspected_at;

SELECT to_regclass('public.payout_account') AS payout_account_table;

SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
	AND table_name = 'payout_account'
	AND column_name IN ('last_payout_status', 'last_payout_at', 'external_account_updated_at', 'stripe_account_id')
ORDER BY column_name;

ROLLBACK;
