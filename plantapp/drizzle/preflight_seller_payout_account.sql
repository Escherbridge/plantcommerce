-- Read-only target inspection for 0014_seller_payout_account.sql. Do not mutate the target database.
BEGIN READ ONLY;

SELECT current_database() AS database_name, current_user AS database_user, now() AS inspected_at;

SELECT to_regclass('public.user') AS user_table,
	to_regclass('public.product') AS product_table,
	to_regclass('public.affiliate') AS affiliate_table,
	to_regclass('public.checkout_draft_item') AS checkout_draft_item_table,
	to_regclass('public.order_item') AS order_item_table,
	to_regclass('public.seller') AS seller_table,
	to_regclass('public.payout_account') AS payout_account_table;

SELECT table_name, column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
	AND (
		(table_name = 'product' AND column_name = 'seller_id')
		OR (table_name = 'checkout_draft_item' AND column_name = 'seller_id')
		OR (table_name = 'order_item' AND column_name = 'seller_id')
		OR table_name IN ('seller', 'payout_account')
	)
ORDER BY table_name, ordinal_position;

SELECT conrelid::regclass AS table_name, conname AS constraint_name, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conname IN (
	'seller_status_check',
	'payout_account_owner_check',
	'payout_account_country_check',
	'product_seller_id_seller_id_fk',
	'checkout_draft_item_seller_id_fk',
	'order_item_seller_id_fk'
)
ORDER BY conname;

ROLLBACK;
