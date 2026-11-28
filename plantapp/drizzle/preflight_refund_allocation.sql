-- Read-only target inspection for 0019_refund_allocation.sql. Do not mutate the target database.
BEGIN READ ONLY;

SELECT current_database() AS database_name, now() AS inspected_at;

SELECT to_regclass('public.refund_allocation') AS refund_allocation_table,
	to_regclass('public.refund_allocation_line') AS refund_allocation_line_table,
	to_regclass('public."order"') AS order_table;

ROLLBACK;
