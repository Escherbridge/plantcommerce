import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Real-Postgres refund flows. Skipped unless FLOW_TEST_DATABASE_URL points at a throwaway database
// (see plantapp/src/lib/server/AGENTS.md, "Payout flow tests").
const databaseUrl = process.env.FLOW_TEST_DATABASE_URL;

vi.mock('$lib/server/db', async () => {
	const url = process.env.FLOW_TEST_DATABASE_URL;
	if (!url) return { db: {}, sqlClient: null };
	const { default: postgres } = await import('postgres');
	const { drizzle } = await import('drizzle-orm/postgres-js');
	const schema = await import('$lib/server/db/schema');
	const sqlClient = postgres(url, { max: 10, onnotice: () => {} });
	return { sqlClient, db: drizzle(sqlClient, { schema }) };
});

describe.skipIf(!databaseUrl)('refund flows on Postgres', { timeout: 30_000 }, () => {
	let sql: Awaited<typeof import('$lib/server/db')>['sqlClient'];
	let apply: typeof import('./refundApply').applyMoneyEvent;

	beforeEach(async () => {
		vi.resetModules();
		sql = (await import('$lib/server/db')).sqlClient;
		apply = (await import('./refundApply')).applyMoneyEvent;
		await sql.unsafe(
			`TRUNCATE "order", "user", seller, payout_account, seller_earning, seller_earning_event,
			 order_balance_hold, payout_transfer CASCADE`
		);
		await sql`INSERT INTO "user" (id, username, email, password_hash) VALUES ('u1','seller','s@example.com','x')`;
		const [seller] =
			await sql`INSERT INTO seller (user_id, display_name) VALUES ('u1','Seller') RETURNING id`;
		const [order] = await sql`
			INSERT INTO "order" (order_number, total_amount, subtotal_amount, customer_email, stripe_charge_id, transfer_group)
			VALUES ('A-1', '100.00', '100.00', 'c@example.com', 'ch_1', 'draft-1') RETURNING id`;
		await sql`INSERT INTO seller_earning (id, order_id, seller_id, currency, line_total_minor, fee_bps, fee_minor, net_minor)
			VALUES ('e1', ${order.id}, ${seller.id}, 'usd', 10000, 800, 800, 9200)`;
		await sql`INSERT INTO seller_earning_event (id, earning_id, event_type, amount_delta_minor, currency, event_reference)
			VALUES ('ev1','e1','pending',9200,'usd','seller-earning:e1:pending')`;
	});

	afterAll(async () => {
		await sql?.end({ timeout: 2 });
	});

	async function clawedMinor(): Promise<number> {
		const [row] =
			await sql`SELECT COALESCE(SUM(ABS(amount_delta_minor)), 0)::int AS total FROM seller_earning_event
			WHERE earning_id = 'e1' AND reason_code = 'refund'`;
		return row.total;
	}

	const refunded = (amount: number) => ({ id: 'ch_1', amount_refunded: amount });

	it('concurrent partial refunds for one charge claw back exactly the cumulative share', async () => {
		await Promise.all([
			apply('charge.refunded', refunded(2500), null),
			apply('charge.refunded', refunded(5000), null)
		]);
		expect(await clawedMinor()).toBe(4600);
	});

	it('a replayed refund event, even concurrently, claws back once', async () => {
		await Promise.all([
			apply('charge.refunded', refunded(2500), null),
			apply('charge.refunded', refunded(2500), null),
			apply('charge.refunded', refunded(2500), null)
		]);
		expect(await clawedMinor()).toBe(2300);
	});

	it('after the seller was paid, a replayed refund reverses at Stripe once and settles the debt', async () => {
		await sql`INSERT INTO payout_transfer (id, kind, earning_id, stripe_account_id, amount_minor, currency, status, idempotency_key, stripe_transfer_id)
			VALUES ('pt1','seller','e1','acct_1',9200,'usd','succeeded','seller-transfer:e1','tr_1')`;
		const reversals: number[] = [];
		const client = {
			transfers: {
				createReversal: async (_id: string, params: { amount?: number }) => {
					await new Promise((resolve) => setTimeout(resolve, 15));
					reversals.push(params.amount ?? 0);
					return { id: `trr_${reversals.length}` };
				}
			}
		};

		await Promise.all([
			apply('charge.refunded', refunded(2500), client),
			apply('charge.refunded', refunded(2500), client)
		]);

		expect(reversals).toEqual([2300]);
		const [{ debt }] =
			await sql`SELECT COALESCE(SUM(amount_delta_minor), 0)::int AS debt FROM seller_earning_event
			WHERE earning_id = 'e1' AND event_type = 'debt'`;
		expect(debt).toBe(0);
	});

	it('a failed Stripe reversal is retried from the recorded debt on the next delivery', async () => {
		await sql`INSERT INTO payout_transfer (id, kind, earning_id, stripe_account_id, amount_minor, currency, status, idempotency_key, stripe_transfer_id)
			VALUES ('pt1','seller','e1','acct_1',9200,'usd','succeeded','seller-transfer:e1','tr_1')`;
		const reversals: number[] = [];
		let failNext = true;
		const client = {
			transfers: {
				createReversal: async (_id: string, params: { amount?: number }) => {
					if (failNext) {
						failNext = false;
						throw new Error('stripe unavailable');
					}
					reversals.push(params.amount ?? 0);
					return { id: 'trr_1' };
				}
			}
		};

		await expect(apply('charge.refunded', refunded(2500), client)).rejects.toThrow();
		// Debt is on the ledger and would be netted from the next transfer even if Stripe never recovers.
		const [{ debt }] =
			await sql`SELECT SUM(amount_delta_minor)::int AS debt FROM seller_earning_event WHERE event_type = 'debt'`;
		expect(debt).toBe(2300);

		await apply('charge.refunded', refunded(2500), client);
		expect(reversals).toEqual([2300]);
	});
});
