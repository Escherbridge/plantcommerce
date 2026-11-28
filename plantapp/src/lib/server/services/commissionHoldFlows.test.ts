import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Real-Postgres: commission approval respects an open refund/dispute hold. Skipped without FLOW_TEST_DATABASE_URL.
const databaseUrl = process.env.FLOW_TEST_DATABASE_URL;

vi.mock('$env/dynamic/private', () => ({ env: { AFFILIATE_LEDGER_ENABLED: 'true' } }));
vi.mock('$lib/server/db', async () => {
	const url = process.env.FLOW_TEST_DATABASE_URL;
	if (!url) return { db: {}, sqlClient: null };
	const { default: postgres } = await import('postgres');
	const { drizzle } = await import('drizzle-orm/postgres-js');
	const schema = await import('$lib/server/db/schema');
	const sqlClient = postgres(url, { max: 5, onnotice: () => {} });
	return { sqlClient, db: drizzle(sqlClient, { schema }) };
});

describe.skipIf(!databaseUrl)('commission approval and balance holds', { timeout: 30_000 }, () => {
	let sql: Awaited<typeof import('$lib/server/db')>['sqlClient'];
	let clear: (orderId: number) => Promise<number>;

	beforeEach(async () => {
		vi.resetModules();
		const { db, sqlClient } = await import('$lib/server/db');
		sql = sqlClient;
		const { AffiliateCommissionService } = await import('./affiliateCommission');
		clear = (orderId) =>
			db.transaction((tx) => AffiliateCommissionService.clearCommissionsForOrder(tx, orderId));
		await sql.unsafe(
			`TRUNCATE "order", affiliate, affiliate_commission_ledger, affiliate_commission_ledger_event, order_balance_hold CASCADE`
		);
		await sql`INSERT INTO "user" (id, username, email, password_hash) VALUES ('u1','a','a@example.com','x') ON CONFLICT DO NOTHING`;
		const [affiliate] =
			await sql`INSERT INTO affiliate (user_id, affiliate_code) VALUES ('u1','C1') RETURNING id`;
		await sql`INSERT INTO "order" (id, order_number, total_amount, subtotal_amount, customer_email, stripe_charge_id)
			VALUES (7, 'A-7', '100.00', '100.00', 'c@example.com', 'ch_7')`;
		await sql`INSERT INTO affiliate_commission_ledger (id, affiliate_id, affiliate_link_id, source_order_id, source_checkout_draft_id,
			source_stripe_webhook_event_id, source_reference, currency, quoted_amount_minor, commission_rate_bps, draft_snapshot_hash,
			tier_code, tier_version, terms_version, disclosure_version)
			VALUES ('c1', ${affiliate.id}, 1, 7, 'd1', 'w1', 'r1', 'usd', 500, 500, ${'a'.repeat(64)}, 'unset', 0, 't', 'd')`;
		await sql`INSERT INTO affiliate_commission_ledger_event (id, commission_id, event_type, amount_delta_minor, currency, event_reference, reason_code)
			VALUES ('p1','c1','pending',500,'usd','commission:c1:pending','initial_accrual')`;
	});

	afterAll(async () => {
		await sql?.end({ timeout: 2 });
	});

	const approvedCount = async () => {
		const [{ count }] =
			await sql`SELECT count(*)::int AS count FROM affiliate_commission_ledger_event WHERE event_type = 'approved'`;
		return count;
	};

	it('an order shipped with an open hold keeps its commission unapproved until the hold closes', async () => {
		await sql`INSERT INTO order_balance_hold (id, order_id, kind, status, stripe_object_id)
			VALUES ('hold:dp_1', 7, 'dispute', 'open', 'dp_1')`;

		expect(await clear(7)).toBe(0);
		expect(await approvedCount()).toBe(0);

		await sql`UPDATE order_balance_hold SET status = 'closed', closed_at = now()`;
		expect(await clear(7)).toBe(1);
		expect(await approvedCount()).toBe(1);
	});
});
