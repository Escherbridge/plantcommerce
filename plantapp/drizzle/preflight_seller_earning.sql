-- Read-only target inspection for 0016_seller_earning.sql. Do not mutate the target database.
BEGIN READ ONLY;

SELECT current_database() AS database_name, current_user AS database_user, now() AS inspected_at;

SELECT to_regclass('public.order') AS order_table,
	to_regclass('public.seller') AS seller_table,
	to_regclass('public.seller_earning') AS seller_earning_table,
	to_regclass('public.seller_earning_event') AS seller_earning_event_table,
	to_regclass('public.order_balance_hold') AS order_balance_hold_table;

SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
	AND table_name = 'order'
	AND column_name IN ('shipped_at', 'delivered_at')
ORDER BY column_name;

ROLLBACK;
