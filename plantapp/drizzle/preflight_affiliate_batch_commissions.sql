-- Read-only target inspection for 0018_affiliate_batch_commissions.sql.
BEGIN READ ONLY;

SELECT current_database() AS database_name, now() AS inspected_at;
SELECT to_regclass('public.affiliate_payout_batch') AS affiliate_payout_batch_table;
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
	AND table_name = 'affiliate_payout_batch'
	AND column_name = 'commission_ids';

ROLLBACK;
