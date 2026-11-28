import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Real-Postgres flows for the money-moving jobs. Runs only when FLOW_TEST_DATABASE_URL points at a throwaway
// database holding the schema (see plantapp/AGENTS.md "Flow tests"); otherwise the suite is skipped.
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

type FakeTransfer = {
	id: string;
	amount: number;
	destination: string;
	transfer_group?: string;
	metadata?: Record<string, string>;
};

/** Stripe stand-in. `honorIdempotency: false` models a key older than Stripe's 24h window. */
function fakeStripe(options: { honorIdempotency?: boolean; pageSize?: number } = {}) {
	const transfers: FakeTransfer[] = [];
	const byKey = new Map<string, FakeTransfer>();
	return {
		transfers,
		client: {
			transfers: {
				create: async (
					params: Omit<FakeTransfer, 'id'> & { currency: string; source_transaction?: string },
					callOptions?: { idempotencyKey?: string }
				) => {
					await new Promise((resolve) => setTimeout(resolve, 15));
					const key = callOptions?.idempotencyKey;
					if (options.honorIdempotency !== false && key && byKey.has(key)) return byKey.get(key)!;
					const created: FakeTransfer = {
						id: `tr_${transfers.length + 1}`,
						amount: params.amount,
						destination: params.destination,
						transfer_group: params.transfer_group,
						metadata: params.metadata
					};
					transfers.push(created);
					if (key) byKey.set(key, created);
					return created;
				},
				list: async (params: {
					transfer_group: string;
					destination?: string;
					starting_after?: string;
				}) => {
					const matching = transfers.filter(
						(transfer) =>
							transfer.transfer_group === params.transfer_group &&
							(!params.destination || transfer.destination === params.destination)
					);
					const size = options.pageSize ?? 100;
					const start = params.starting_after
						? matching.findIndex((transfer) => transfer.id === params.starting_after) + 1
						: 0;
					const data = matching.slice(start, start + size);
					return { data, has_more: start + size < matching.length };
				}
			}
		}
	};
}

const releasedEnv = {
	SELLER_TRANSFERS_ENABLED: 'true',
	PAYOUT_HOLD_DAYS_AFTER_DELIVERY: '14'
};

describe.skipIf(!databaseUrl)('payout flows on Postgres', { timeout: 30_000 }, () => {
	let sql: Awaited<typeof import('$lib/server/db')>['sqlClient'];
	let jobs: typeof import('./payoutJobs');

	async function loadModules() {
		const dbModule = await import('$lib/server/db');
		sql = dbModule.sqlClient;
		jobs = await import('./payoutJobs');
	}

	async function resetAndSeedSeller(options: { transferGroup: string | null; netMinor?: number }) {
		await loadModules();
		await sql.unsafe(
			`TRUNCATE "order", "user", seller, payout_account, seller_earning, seller_earning_event,
			 order_balance_hold, payout_transfer, affiliate, affiliate_commission_ledger,
			 affiliate_commission_ledger_event, affiliate_payout, affiliate_payout_batch CASCADE`
		);
		await sql`INSERT INTO "user" (id, username, email, password_hash) VALUES ('u1','seller','s@example.com','x')`;
		const [seller] =
			await sql`INSERT INTO seller (user_id, display_name) VALUES ('u1','Seller') RETURNING id`;
		const [order] = await sql`
			INSERT INTO "order" (order_number, total_amount, subtotal_amount, customer_email, stripe_charge_id, transfer_group)
			VALUES ('A-1', '100.00', '100.00', 'c@example.com', 'ch_1', ${options.transferGroup}) RETURNING id`;
		await sql`INSERT INTO payout_account (id, owner_type, seller_id, stripe_account_id, transfers_active)
			VALUES ('pa1','seller',${seller.id},'acct_1',true)`;
		const net = options.netMinor ?? 9200;
		await sql`INSERT INTO seller_earning (id, order_id, seller_id, currency, line_total_minor, fee_bps, fee_minor, net_minor)
			VALUES ('e1', ${order.id}, ${seller.id}, 'usd', 10000, 800, ${10000 - net}, ${net})`;
		await sql`INSERT INTO seller_earning_event (id, earning_id, event_type, amount_delta_minor, currency, event_reference)
			VALUES ('ev1','e1','pending',${net},'usd','seller-earning:e1:pending'),
			       ('ev2','e1','released',0,'usd','seller-earning:e1:released')`;
		return { sellerId: seller.id as number, orderId: order.id as number };
	}

	async function transferRows() {
		return sql`SELECT status, amount_minor::int AS amount, stripe_transfer_id FROM payout_transfer WHERE earning_id = 'e1' ORDER BY created_at`;
	}

	afterAll(async () => {
		await sql?.end({ timeout: 2 });
	});

	describe('seller transfers', () => {
		beforeEach(() => vi.resetModules());

		it('two concurrent runs pay once, even when Stripe would not dedupe the key', async () => {
			await resetAndSeedSeller({ transferGroup: 'draft-1' });
			const stripe = fakeStripe({ honorIdempotency: false });
			const results = await Promise.all([
				jobs.runSellerTransfers(releasedEnv, stripe.client),
				jobs.runSellerTransfers(releasedEnv, stripe.client)
			]);
			expect(stripe.transfers).toHaveLength(1);
			expect(stripe.transfers[0].amount).toBe(9200);
			expect(results.map((result) => result.transferred).sort()).toEqual([0, 1]);
			expect(await transferRows()).toMatchObject([{ status: 'succeeded', amount: 9200 }]);
		});

		it('a crash after the Stripe call on an order without a transfer group resumes without a second transfer', async () => {
			const { orderId } = await resetAndSeedSeller({ transferGroup: null });
			const stripe = fakeStripe({ honorIdempotency: false });
			// State a crash leaves behind: Stripe holds the transfer, the DB still has only the pending claim.
			stripe.transfers.push({
				id: 'tr_crashed',
				amount: 9200,
				destination: 'acct_1',
				transfer_group: 'earning:e1',
				metadata: { earning_id: 'e1', order_id: String(orderId) }
			});
			await sql`INSERT INTO payout_transfer (id, kind, earning_id, stripe_account_id, amount_minor, currency, status, idempotency_key, created_at, updated_at)
				VALUES ('pt1','seller','e1','acct_1',9200,'usd','pending','seller-transfer:e1', now() - interval '1 hour', now() - interval '1 hour')`;

			await jobs.runSellerTransfers(releasedEnv, stripe.client);

			expect(stripe.transfers).toHaveLength(1);
			expect(await transferRows()).toMatchObject([
				{ status: 'succeeded', stripe_transfer_id: 'tr_crashed' }
			]);
		});

		it('finds the earlier transfer when it is not on the first page of results', async () => {
			await resetAndSeedSeller({ transferGroup: 'draft-1' });
			const stripe = fakeStripe({ honorIdempotency: false, pageSize: 2 });
			for (let index = 0; index < 5; index += 1) {
				stripe.transfers.push({
					id: `tr_other_${index}`,
					amount: 100,
					destination: 'acct_1',
					transfer_group: 'draft-1',
					metadata: { earning_id: `other-${index}` }
				});
			}
			stripe.transfers.push({
				id: 'tr_mine',
				amount: 9200,
				destination: 'acct_1',
				transfer_group: 'draft-1',
				metadata: { earning_id: 'e1' }
			});
			await sql`INSERT INTO payout_transfer (id, kind, earning_id, stripe_account_id, amount_minor, currency, status, idempotency_key, created_at, updated_at)
				VALUES ('pt1','seller','e1','acct_1',9200,'usd','pending','seller-transfer:e1', now() - interval '1 hour', now() - interval '1 hour')`;

			await jobs.runSellerTransfers(releasedEnv, stripe.client);

			expect(stripe.transfers).toHaveLength(6);
			expect(await transferRows()).toMatchObject([
				{ status: 'succeeded', stripe_transfer_id: 'tr_mine' }
			]);
		});

		it('after the seller switched payout account, finds the earlier send at the old account instead of re-sending', async () => {
			await resetAndSeedSeller({ transferGroup: 'draft-1' });
			const stripe = fakeStripe({ honorIdempotency: false });
			stripe.transfers.push({
				id: 'tr_old',
				amount: 9200,
				destination: 'acct_old',
				transfer_group: 'draft-1',
				metadata: { earning_id: 'e1' }
			});
			await sql`INSERT INTO payout_transfer (id, kind, earning_id, stripe_account_id, amount_minor, currency, status, idempotency_key, created_at, updated_at)
				VALUES ('pt1','seller','e1','acct_old',9200,'usd','pending','seller-transfer:e1', now() - interval '1 hour', now() - interval '1 hour')`;

			await jobs.runSellerTransfers(releasedEnv, stripe.client);

			expect(stripe.transfers).toHaveLength(1);
			expect(await transferRows()).toMatchObject([
				{ status: 'succeeded', stripe_transfer_id: 'tr_old' }
			]);
		});

		it('after the seller switched payout account with no proof of the earlier send, holds for review and sends nothing', async () => {
			await resetAndSeedSeller({ transferGroup: 'draft-1' });
			const stripe = fakeStripe({ honorIdempotency: false });
			await sql`INSERT INTO payout_transfer (id, kind, earning_id, stripe_account_id, amount_minor, currency, status, idempotency_key, created_at, updated_at)
				VALUES ('pt1','seller','e1','acct_old',9200,'usd','pending','seller-transfer:e1', now() - interval '1 hour', now() - interval '1 hour')`;

			await jobs.runSellerTransfers(releasedEnv, stripe.client);

			expect(stripe.transfers).toHaveLength(0);
			const rows =
				await sql`SELECT status, failure_reason FROM payout_transfer ORDER BY idempotency_key`;
			expect(rows).toMatchObject([
				{ status: 'pending' },
				{ status: 'failed', failure_reason: 'destination_changed_manual_review' }
			]);
		});

		it('a live claim is left alone, a stale claim whose refund landed pays only what is still owed', async () => {
			await resetAndSeedSeller({ transferGroup: 'draft-1' });
			await sql`INSERT INTO payout_transfer (id, kind, earning_id, stripe_account_id, amount_minor, currency, status, idempotency_key)
				VALUES ('pt1','seller','e1','acct_1',9200,'usd','pending','seller-transfer:e1')`;
			const stripe = fakeStripe();

			await jobs.runSellerTransfers(releasedEnv, stripe.client);
			expect(stripe.transfers).toHaveLength(0);

			// The claim goes stale and a 25% refund reverses 2300 before the retry.
			await sql`UPDATE payout_transfer SET updated_at = now() - interval '1 hour'`;
			await sql`INSERT INTO seller_earning_event (id, earning_id, event_type, amount_delta_minor, currency, event_reference, reason_code)
				VALUES ('ev3','e1','reversed',-2300,'usd','seller-earning:e1:reversed:ch_1:2500','refund')`;
			await jobs.runSellerTransfers(releasedEnv, stripe.client);

			expect(stripe.transfers.map((transfer) => transfer.amount)).toEqual([6900]);
			expect(await transferRows()).toMatchObject([{ status: 'succeeded', amount: 6900 }]);
		});

		it('a fully refunded pending claim sends nothing and restores the debt it reserved', async () => {
			await resetAndSeedSeller({ transferGroup: 'draft-1' });
			await sql`INSERT INTO seller_earning_event (id, earning_id, event_type, amount_delta_minor, currency, event_reference, reason_code)
				VALUES ('ev3','e1','debt',-3000,'usd','seller-earning:e1:debt-settled','debt_settled'),
				       ('ev4','e1','reversed',-9200,'usd','seller-earning:e1:reversed:ch_1:10000','refund')`;
			await sql`INSERT INTO payout_transfer (id, kind, earning_id, stripe_account_id, amount_minor, currency, status, idempotency_key, created_at, updated_at)
				VALUES ('pt1','seller','e1','acct_1',6200,'usd','pending','seller-transfer:e1', now() - interval '1 hour', now() - interval '1 hour')`;
			const stripe = fakeStripe();

			await jobs.runSellerTransfers(releasedEnv, stripe.client);

			expect(stripe.transfers).toHaveLength(0);
			expect(await transferRows()).toMatchObject([{ status: 'skipped', amount: 0 }]);
			const [restored] =
				await sql`SELECT amount_delta_minor::int AS amount FROM seller_earning_event WHERE event_reference = 'seller-earning:e1:debt-restored'`;
			expect(restored.amount).toBe(3000);
		});

		it('a refund that lands while the transfer is in flight leaves the excess as seller debt', async () => {
			await resetAndSeedSeller({ transferGroup: 'draft-1' });
			const stripe = fakeStripe();
			const create = stripe.client.transfers.create;
			stripe.client.transfers.create = async (...args: Parameters<typeof create>) => {
				// The refund is recorded as a pre-transfer reduction while Stripe is still working.
				await sql`INSERT INTO seller_earning_event (id, earning_id, event_type, amount_delta_minor, currency, event_reference, reason_code)
					VALUES ('evr','e1','reversed',-2300,'usd','seller-earning:e1:reversed:ch_1:2500','refund')`;
				return create(...args);
			};

			await jobs.runSellerTransfers(releasedEnv, stripe.client);

			expect(stripe.transfers.map((transfer) => transfer.amount)).toEqual([9200]);
			const [debt] =
				await sql`SELECT amount_delta_minor::int AS amount FROM seller_earning_event WHERE event_reference = 'seller-earning:e1:debt:send-overpay'`;
			expect(debt.amount).toBe(2300);
		});

		it('does not net refund debt that is reserved for a Stripe reversal', async () => {
			const { sellerId } = await resetAndSeedSeller({ transferGroup: 'draft-1' });
			const [otherOrder] = await sql`
				INSERT INTO "order" (order_number, total_amount, subtotal_amount, customer_email)
				VALUES ('A-0', '100.00', '100.00', 'c@example.com') RETURNING id`;
			await sql`INSERT INTO seller_earning (id, order_id, seller_id, currency, line_total_minor, fee_bps, fee_minor, net_minor)
				VALUES ('e0', ${otherOrder.id}, ${sellerId}, 'usd', 10000, 800, 800, 9200)`;
			await sql`INSERT INTO seller_earning_event (id, earning_id, event_type, amount_delta_minor, currency, event_reference, reason_code)
				VALUES ('d1','e0','debt',2300,'usd','seller-earning:e0:debt-reserved:ch_9:2500','refund')`;
			const stripe = fakeStripe();

			await jobs.runSellerTransfers(releasedEnv, stripe.client);

			expect(stripe.transfers.map((transfer) => transfer.amount)).toEqual([9200]);
		});

		it('nets only same-currency debt from the transfer', async () => {
			const { sellerId } = await resetAndSeedSeller({ transferGroup: 'draft-1' });
			const [otherOrder] = await sql`
				INSERT INTO "order" (order_number, total_amount, subtotal_amount, customer_email)
				VALUES ('A-0', '100.00', '100.00', 'c@example.com') RETURNING id`;
			await sql`INSERT INTO seller_earning (id, order_id, seller_id, currency, line_total_minor, fee_bps, fee_minor, net_minor)
				VALUES ('e0', ${otherOrder.id}, ${sellerId}, 'eur', 10000, 800, 800, 9200)`;
			await sql`INSERT INTO seller_earning_event (id, earning_id, event_type, amount_delta_minor, currency, event_reference, reason_code)
				VALUES ('d1','e0','debt',5000,'eur','seller-earning:e0:debt:x','refund')`;
			const stripe = fakeStripe();

			await jobs.runSellerTransfers(releasedEnv, stripe.client);

			expect(stripe.transfers.map((transfer) => transfer.amount)).toEqual([9200]);
		});
	});

	describe('affiliate batches', () => {
		beforeEach(() => vi.resetModules());

		const batchEnv = {
			AFFILIATE_PAYOUTS_ENABLED: 'true',
			AFFILIATE_COMMISSION_BPS: '500',
			AFFILIATE_ATTRIBUTION_WINDOW_DAYS: '30',
			AFFILIATE_PAYOUT_MINIMUM_MINOR: '1',
			AFFILIATE_PAYOUT_FLOAT_MINOR: '1',
			AFFILIATE_BATCH_APPROVAL_THRESHOLD_MINOR: '1000000'
		};

		async function seedCommission(commissionCount: number) {
			await resetAndSeedSeller({ transferGroup: 'draft-1' });
			const [affiliate] =
				await sql`INSERT INTO affiliate (user_id, affiliate_code) VALUES ('u1','CODE1') RETURNING id`;
			await sql`INSERT INTO payout_account (id, owner_type, affiliate_id, stripe_account_id, transfers_active)
				VALUES ('pa2','affiliate',${affiliate.id},'acct_2',true)`;
			for (let index = 0; index < commissionCount; index += 1) {
				const id = `c${index}`;
				await sql`INSERT INTO affiliate_commission_ledger (id, affiliate_id, affiliate_link_id, source_order_id, source_checkout_draft_id,
					source_stripe_webhook_event_id, source_reference, currency, quoted_amount_minor, commission_rate_bps, draft_snapshot_hash,
					tier_code, tier_version, terms_version, disclosure_version)
					VALUES (${id}, ${affiliate.id}, 1, ${index + 1}, ${'d' + index}, ${'w' + index}, ${'r' + index}, 'usd', 500, 500, ${'a'.repeat(64)}, 'unset', 0, 't', 'd')`;
				await sql`INSERT INTO affiliate_commission_ledger_event (id, commission_id, event_type, amount_delta_minor, currency, event_reference, reason_code)
					VALUES (${'p' + index}, ${id}, 'pending', 500, 'usd', ${'commission:' + id + ':pending'}, 'initial_accrual'),
					       (${'a' + index}, ${id}, 'approved', 0, 'usd', ${'commission:' + id + ':approved'}, 'manual_adjustment')`;
			}
		}

		it('two concurrent batch runs put each commission in one batch and pay it once', async () => {
			await seedCommission(2);
			const stripe = fakeStripe({ honorIdempotency: false });

			await Promise.all([
				jobs.runAffiliateBatch(batchEnv, stripe.client),
				jobs.runAffiliateBatch(batchEnv, stripe.client)
			]);

			expect(stripe.transfers.map((transfer) => transfer.amount)).toEqual([1000]);
			const [{ count }] =
				await sql`SELECT count(*)::int AS count FROM affiliate_commission_ledger_event WHERE event_type = 'payable'`;
			expect(count).toBe(2);
			const batches = await sql`SELECT status FROM affiliate_payout_batch`;
			expect(batches.map((row) => row.status)).toEqual(['paid']);
		});

		it('a reversal after a commission was paid is netted from the affiliate next batch', async () => {
			await seedCommission(2);
			// c0 was already paid; 200 of it was reversed afterwards. c1 is the new approved commission (500).
			await sql`INSERT INTO affiliate_payout (id, affiliate_id, payout_reference, currency, amount_minor)
				SELECT 'po0', affiliate_id, 'batch:old', 'usd', 500 FROM affiliate_commission_ledger WHERE id = 'c0'`;
			await sql`INSERT INTO affiliate_commission_ledger_event (id, commission_id, event_type, amount_delta_minor, currency, event_reference, reason_code, payout_id, created_at)
				VALUES ('x1','c0','payable',0,'usd','commission:c0:payable','payout','po0', now() - interval '3 hours'),
				       ('x2','c0','paid',0,'usd','commission:c0:paid','payout','po0', now() - interval '2 hours'),
				       ('x3','c0','reversed',-200,'usd','commission:c0:reversal:refund:ch_x','refund', NULL, now() - interval '1 hour')`;
			const stripe = fakeStripe();

			await jobs.runAffiliateBatch(batchEnv, stripe.client);

			// Only c1 (500) is claimable; 200 of debt comes off it.
			expect(stripe.transfers.map((transfer) => transfer.amount)).toEqual([300]);
		});

		it('a batch claimed but not yet sent is re-priced down by a later reversal', async () => {
			await seedCommission(1);
			await jobs.runAffiliateBatch(batchEnv, null);
			await sql`INSERT INTO affiliate_commission_ledger_event (id, commission_id, event_type, amount_delta_minor, currency, event_reference, reason_code)
				VALUES ('r1','c0','reversed',-200,'usd','commission:c0:reversal:refund:ch_x','refund')`;
			const stripe = fakeStripe();

			await jobs.runAffiliateBatch(batchEnv, stripe.client);

			expect(stripe.transfers.map((transfer) => transfer.amount)).toEqual([300]);
		});

		it('a slow claimant stamped with an old caller clock keeps its lease against a second worker', async () => {
			await seedCommission(1);
			const stripe = fakeStripe();
			const slowCreate = stripe.client.transfers.create;
			stripe.client.transfers.create = async (...args: Parameters<typeof slowCreate>) => {
				await new Promise((resolve) => setTimeout(resolve, 400));
				return slowCreate(...args);
			};
			const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

			const first = jobs.runAffiliateBatch(batchEnv, stripe.client, tenMinutesAgo);
			await new Promise((resolve) => setTimeout(resolve, 200));
			await jobs.runAffiliateBatch(batchEnv, stripe.client);
			await first;

			expect(stripe.transfers).toHaveLength(1);
			const [done] = await sql`SELECT status FROM affiliate_payout_batch`;
			expect(done.status).toBe('paid');
		});

		it('after the affiliate switched payout account, holds the batch for review and sends nothing', async () => {
			await seedCommission(1);
			await jobs.runAffiliateBatch(batchEnv, null);
			await sql`UPDATE affiliate_payout_batch SET status = 'sending', send_amount_minor = 500,
				send_stripe_account_id = 'acct_old', send_started_at = now() - interval '1 hour'`;
			const stripe = fakeStripe({ honorIdempotency: false });

			await jobs.runAffiliateBatch(batchEnv, stripe.client);

			expect(stripe.transfers).toHaveLength(0);
			const [batch] = await sql`SELECT status FROM affiliate_payout_batch`;
			expect(batch.status).toBe('sending');
			const [flag] = await sql`SELECT failure_reason FROM payout_transfer WHERE kind = 'affiliate'`;
			expect(flag.failure_reason).toBe('destination_changed_manual_review');
		});

		it('a crash after the Stripe call resumes from the stored amount without a second transfer', async () => {
			await seedCommission(1);
			const stripe = fakeStripe({ honorIdempotency: false });
			await jobs.runAffiliateBatch(batchEnv, null);
			const [batch] = await sql`SELECT id FROM affiliate_payout_batch`;
			// Crash state: claimed (sending, amount fixed), transfer exists at Stripe, nothing recorded locally.
			await sql`UPDATE affiliate_payout_batch SET status = 'sending', send_amount_minor = 500,
				send_stripe_account_id = 'acct_2', send_started_at = now() - interval '1 hour'`;
			stripe.transfers.push({
				id: 'tr_crashed',
				amount: 500,
				destination: 'acct_2',
				transfer_group: `affiliate-batch:${batch.id}`,
				metadata: { batch_id: batch.id }
			});

			await jobs.runAffiliateBatch(batchEnv, stripe.client);

			expect(stripe.transfers).toHaveLength(1);
			const [done] = await sql`SELECT status FROM affiliate_payout_batch`;
			expect(done.status).toBe('paid');
			const [recorded] =
				await sql`SELECT stripe_transfer_id FROM payout_transfer WHERE kind = 'affiliate'`;
			expect(recorded.stripe_transfer_id).toBe('tr_crashed');
		});
	});
});
