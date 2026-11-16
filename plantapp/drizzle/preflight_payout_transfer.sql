-- Read-only target inspection for 0017_payout_transfer.sql. Do not mutate the target database.
BEGIN READ ONLY;

SELECT current_database() AS database_name, now() AS inspected_at;

SELECT to_regclass('public.seller_earning') AS seller_earning_table,
	to_regclass('public.payout_transfer') AS payout_transfer_table,
	to_regclass('public.affiliate_payout_batch') AS affiliate_payout_batch_table;

ROLLBACK;
