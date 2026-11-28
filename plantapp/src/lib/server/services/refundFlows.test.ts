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
			 order_balance_hold, payout_transfer, order_item, product, refund_allocation, refund_allocation_line CASCADE`
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

	/** Seller already paid 9200 for e1 (transfer tr_1). Optionally a second released earning e2 on another order. */
	async function seedPaidSeller(options: { withSecondEarning?: boolean } = {}) {
		await sql`INSERT INTO payout_transfer (id, kind, earning_id, stripe_account_id, amount_minor, currency, status, idempotency_key, stripe_transfer_id)
			VALUES ('pt1','seller','e1','acct_1',9200,'usd','succeeded','seller-transfer:e1','tr_1')`;
		await sql`INSERT INTO seller_earning_event (id, earning_id, event_type, amount_delta_minor, currency, event_reference)
			VALUES ('ev9','e1','transferred',0,'usd','seller-earning:e1:transferred')`;
		const [seller] = await sql`SELECT id FROM seller LIMIT 1`;
		await sql`INSERT INTO payout_account (id, owner_type, seller_id, stripe_account_id, transfers_active)
			VALUES ('pa1','seller',${seller.id},'acct_1',true)`;
		if (options.withSecondEarning) {
			const [order2] = await sql`
				INSERT INTO "order" (order_number, total_amount, subtotal_amount, customer_email, stripe_charge_id, transfer_group)
				VALUES ('A-2', '100.00', '100.00', 'c@example.com', 'ch_2', 'draft-2') RETURNING id`;
			await sql`INSERT INTO seller_earning (id, order_id, seller_id, currency, line_total_minor, fee_bps, fee_minor, net_minor)
				VALUES ('e2', ${order2.id}, ${seller.id}, 'usd', 10000, 800, 800, 9200)`;
			await sql`INSERT INTO seller_earning_event (id, earning_id, event_type, amount_delta_minor, currency, event_reference)
				VALUES ('ev10','e2','pending',9200,'usd','seller-earning:e2:pending'),
				       ('ev11','e2','released',0,'usd','seller-earning:e2:released')`;
		}
	}

	function reversalClient(options: {
		delayMs?: number;
		createFails?: boolean | 'refused';
		listFails?: boolean;
		already?: { id: string; amount: number; metadata: Record<string, string> }[];
	}) {
		const reversals: number[] = [];
		const keys: string[] = [];
		const client = {
			transfers: {
				createReversal: async (
					_id: string,
					params: { amount?: number },
					callOptions?: { idempotencyKey?: string }
				) => {
					keys.push(callOptions?.idempotencyKey ?? '');
					if (options.delayMs) await new Promise((resolve) => setTimeout(resolve, options.delayMs));
					if (options.createFails === 'refused') {
						throw Object.assign(new Error('insufficient funds'), {
							type: 'StripeInvalidRequestError',
							statusCode: 400
						});
					}
					if (options.createFails) {
						throw Object.assign(new Error('socket hang up'), { type: 'StripeConnectionError' });
					}
					reversals.push(params.amount ?? 0);
					return { id: `trr_${reversals.length}` };
				},
				listReversals: async () => {
					if (options.listFails) throw new Error('stripe unreadable');
					return { data: options.already ?? [], has_more: false };
				}
			}
		};
		return { client, reversals, keys };
	}

	async function nettableDebtMinor(): Promise<number> {
		const [row] =
			await sql`SELECT COALESCE(SUM(amount_delta_minor), 0)::int AS total FROM seller_earning_event
			WHERE event_type = 'debt' AND event_reference NOT LIKE '%:debt-reserved:%'`;
		return row.total;
	}

	it('after the seller was paid, a replayed refund reverses at Stripe once and leaves no nettable debt', async () => {
		await seedPaidSeller();
		const { client, reversals } = reversalClient({ delayMs: 15 });

		await Promise.all([
			apply('charge.refunded', refunded(2500), client),
			apply('charge.refunded', refunded(2500), client)
		]);

		expect(reversals).toEqual([2300]);
		expect(await nettableDebtMinor()).toBe(0);
	});

	it('a payout run interleaved with the reversal debits the seller exactly once', async () => {
		await seedPaidSeller({ withSecondEarning: true });
		const payouts = (await import('./payoutJobs')) as typeof import('./payoutJobs');
		const { client, reversals } = reversalClient({ delayMs: 300 });
		const sent: number[] = [];
		const stripe = {
			transfers: {
				create: async (params: { amount: number }) => {
					sent.push(params.amount);
					return { id: 'tr_2' };
				},
				list: async () => ({ data: [], has_more: false })
			}
		};

		const refund = apply('charge.refunded', refunded(2500), client);
		await new Promise((resolve) => setTimeout(resolve, 100));
		await payouts.runSellerTransfers(
			{ SELLER_TRANSFERS_ENABLED: 'true', PAYOUT_HOLD_DAYS_AFTER_DELIVERY: '14' },
			stripe
		);
		await refund;

		// 2300 came back through the Stripe reversal; the next payout was not reduced by the same 2300.
		expect(reversals).toEqual([2300]);
		expect(sent).toEqual([9200]);
	});

	it('a definitively refused reversal becomes ordinary debt, netted once from the next payout', async () => {
		await seedPaidSeller({ withSecondEarning: true });
		const payouts = await import('./payoutJobs');
		const { client } = reversalClient({ createFails: 'refused' });
		const sent: number[] = [];
		const stripe = {
			transfers: {
				create: async (params: { amount: number }) => {
					sent.push(params.amount);
					return { id: 'tr_2' };
				},
				list: async () => ({ data: [], has_more: false })
			}
		};

		await apply('charge.refunded', refunded(2500), client);
		await apply('charge.refunded', refunded(2500), client);
		expect(await nettableDebtMinor()).toBe(2300);

		await payouts.runSellerTransfers(
			{ SELLER_TRANSFERS_ENABLED: 'true', PAYOUT_HOLD_DAYS_AFTER_DELIVERY: '14' },
			stripe
		);
		expect(sent).toEqual([6900]);
		expect(await nettableDebtMinor()).toBe(0);
	});

	it('a connection error whose reversal exists on the next attempt debits the seller exactly once', async () => {
		await seedPaidSeller({ withSecondEarning: true });
		const payouts = await import('./payoutJobs');
		// Stripe applied the reversal but the response was lost, and the list has not caught up yet.
		const lost = reversalClient({ createFails: true });
		await expect(apply('charge.refunded', refunded(2500), lost.client)).rejects.toThrow();
		expect(await nettableDebtMinor()).toBe(0);

		const sent: number[] = [];
		const stripe = {
			transfers: {
				create: async (params: { amount: number }) => {
					sent.push(params.amount);
					return { id: 'tr_2' };
				},
				list: async () => ({ data: [], has_more: false })
			}
		};
		// A payout run in between must not net the reserved debt.
		await payouts.runSellerTransfers(
			{ SELLER_TRANSFERS_ENABLED: 'true', PAYOUT_HOLD_DAYS_AFTER_DELIVERY: '14' },
			stripe
		);
		expect(sent).toEqual([9200]);

		// The retry reuses the same idempotency key, so Stripe returns the reversal it already made.
		const retry = reversalClient({});
		await apply('charge.refunded', refunded(2500), retry.client);
		expect(retry.keys).toEqual(lost.keys);
		expect(await nettableDebtMinor()).toBe(0);
		const [{ count }] =
			await sql`SELECT count(*)::int AS count FROM seller_earning_event WHERE event_reference LIKE '%:reversed-at-stripe:%'`;
		expect(count).toBe(1);
	});

	it('an unknown reversal outcome stays reserved, not nettable, and is settled on retry without a second reversal', async () => {
		await seedPaidSeller();
		const unknown = reversalClient({ createFails: true, listFails: true });
		await expect(apply('charge.refunded', refunded(2500), unknown.client)).rejects.toThrow();
		expect(await nettableDebtMinor()).toBe(0);

		// Stripe did apply the reversal after all; the retry finds it by metadata instead of creating another.
		const recovered = reversalClient({
			already: [{ id: 'trr_x', amount: 2300, metadata: { earning_id: 'e1', source: 'ch_1:2500' } }]
		});
		recovered.client.transfers.createReversal = async () => {
			throw new Error('must not create a second reversal');
		};
		await apply('charge.refunded', refunded(2500), recovered.client);

		expect(await nettableDebtMinor()).toBe(0);
		const [settled] =
			await sql`SELECT stripe_reversal_id FROM seller_earning_event WHERE event_reference LIKE '%:reversed-at-stripe:%'`;
		expect(settled.stripe_reversal_id).toBe('trr_x');
	});

	it('over random refund and payout sequences the seller recovers exactly the refunded share, never more', async () => {
		await seedPaidSeller();
		const { client } = reversalClient({});
		let seed = 12345;
		const random = () => {
			seed = (seed * 1664525 + 1013904223) % 4294967296;
			return seed / 4294967296;
		};
		let cumulative = 0;
		for (let step = 0; step < 12; step += 1) {
			cumulative = Math.min(10000, cumulative + Math.floor(random() * 2000));
			await apply('charge.refunded', refunded(cumulative), random() < 0.5 ? client : null);
			if (random() < 0.4) await apply('charge.refunded', refunded(cumulative), client);
		}
		const [{ recovered }] =
			await sql`SELECT COALESCE(SUM(ABS(amount_delta_minor)), 0)::int AS recovered FROM seller_earning_event
			WHERE earning_id = 'e1' AND event_type = 'reversed'`;
		const [{ owed }] =
			await sql`SELECT COALESCE(SUM(amount_delta_minor), 0)::int AS owed FROM seller_earning_event
			WHERE earning_id = 'e1' AND event_type = 'debt' AND event_reference NOT LIKE '%:debt-reserved:%'`;
		const refundedShare = Math.round((9200 * cumulative) / 10000);
		expect(recovered + owed).toBe(refundedShare);
	});

	it('a refund landing while the seller transfer is in flight becomes debt, not a silent pre-transfer reduction', async () => {
		await seedPaidSeller({ withSecondEarning: false });
		await sql`DELETE FROM payout_transfer`;
		await sql`DELETE FROM seller_earning_event WHERE event_type = 'transferred'`;
		await sql`INSERT INTO seller_earning_event (id, earning_id, event_type, amount_delta_minor, currency, event_reference)
			VALUES ('rel','e1','released',0,'usd','seller-earning:e1:released')`;
		const payouts = await import('./payoutJobs');
		let sent = 0;
		const stripe = {
			transfers: {
				create: async (params: { amount: number }) => {
					await new Promise((resolve) => setTimeout(resolve, 500));
					sent += params.amount;
					return { id: 'tr_1' };
				},
				list: async () => ({ data: [], has_more: false })
			}
		};
		const { client } = reversalClient({});

		const payout = payouts.runSellerTransfers(
			{ SELLER_TRANSFERS_ENABLED: 'true', PAYOUT_HOLD_DAYS_AFTER_DELIVERY: '14' },
			stripe
		);
		await new Promise((resolve) => setTimeout(resolve, 200));
		await apply('charge.refunded', refunded(2500), client);
		await payout;

		expect(sent).toBe(9200);
		const [{ reversed }] =
			await sql`SELECT count(*)::int AS reversed FROM seller_earning_event WHERE event_type = 'reversed'`;
		expect(reversed).toBe(0);
		expect(await nettableDebtMinor()).toBe(2300);
	});

	it('a timed-out reversal that did reach Stripe is adopted after the idempotency window, never repeated or released', async () => {
		await seedPaidSeller({ withSecondEarning: true });
		const stripeReversals: { id: string; amount: number; metadata: Record<string, string> }[] = [];
		let visible = false;
		const make = (lost: boolean) => ({
			transfers: {
				createReversal: async (
					_id: string,
					params: { amount?: number; metadata?: Record<string, string> }
				) => {
					stripeReversals.push({
						id: `trr_${stripeReversals.length + 1}`,
						amount: params.amount ?? 0,
						metadata: params.metadata ?? {}
					});
					if (lost) throw Object.assign(new Error('timeout'), { type: 'StripeConnectionError' });
					return { id: stripeReversals[stripeReversals.length - 1].id };
				},
				listReversals: async () => ({ data: visible ? stripeReversals : [], has_more: false })
			}
		});

		await expect(apply('charge.refunded', refunded(2500), make(true))).rejects.toThrow();
		expect(await nettableDebtMinor()).toBe(0);

		// Two days later the key has expired (a create would make a second reversal) and the list has caught up.
		visible = true;
		await apply('charge.refunded', refunded(2500), make(false));

		expect(stripeReversals).toHaveLength(1);
		expect(await nettableDebtMinor()).toBe(0);
		const [{ count }] =
			await sql`SELECT count(*)::int AS count FROM seller_earning_event WHERE event_reference LIKE '%:reversed-at-stripe:%'`;
		expect(count).toBe(1);
	});

	it('the admin sweep settles a reservation no webhook retry will reach', async () => {
		await seedPaidSeller();
		const lost = reversalClient({ createFails: true, listFails: true });
		await expect(apply('charge.refunded', refunded(2500), lost.client)).rejects.toThrow();
		const core = await import('./refundCore');
		expect(await core.listReservedDebt()).toMatchObject([{ earningId: 'e1', reservedMinor: 2300 }]);

		const healthy = reversalClient({});
		const result = await core.sweepReservedDebt(healthy.client);

		expect(result).toEqual({ settled: 1, stillReserved: 0 });
		expect(healthy.reversals).toEqual([2300]);
		expect(await core.listReservedDebt()).toEqual([]);
	});

	describe('partial refunds on multi-seller orders', () => {
		beforeEach(async () => {
			// Order 1 holds seller A (e1, line 6000) and seller B (e2, line 4000); both already have earnings.
			const [orderRow] = await sql`SELECT id FROM "order" LIMIT 1`;
			await sql`INSERT INTO "user" (id, username, email, password_hash) VALUES ('u2','sellerb','b@example.com','x')`;
			const [sellerB] =
				await sql`INSERT INTO seller (user_id, display_name) VALUES ('u2','B') RETURNING id`;
			const [sellerA] = await sql`SELECT id FROM seller WHERE user_id = 'u1'`;
			await sql`UPDATE seller_earning SET line_total_minor = 6000, fee_minor = 480, net_minor = 5520 WHERE id = 'e1'`;
			await sql`UPDATE seller_earning_event SET amount_delta_minor = 5520 WHERE id = 'ev1'`;
			await sql`INSERT INTO seller_earning (id, order_id, seller_id, currency, line_total_minor, fee_bps, fee_minor, net_minor)
				VALUES ('e2', ${orderRow.id}, ${sellerB.id}, 'usd', 4000, 800, 320, 3680)`;
			await sql`INSERT INTO seller_earning_event (id, earning_id, event_type, amount_delta_minor, currency, event_reference)
				VALUES ('ev2','e2','pending',3680,'usd','seller-earning:e2:pending')`;
			await sql`INSERT INTO product (id, name, slug, sku, price, category_id) VALUES (1,'p','p','p','1.00',1) ON CONFLICT DO NOTHING`;
			await sql`INSERT INTO order_item (id, order_id, product_id, product_name, product_sku, quantity, unit_price, total_price, seller_id)
				VALUES (1, ${orderRow.id}, 1, 'A item', 'a', 1, '60.00', '60.00', ${sellerA.id}),
				       (2, ${orderRow.id}, 1, 'B item', 'b', 1, '40.00', '40.00', ${sellerB.id})`;
		});

		const claw = async (earningId: string) => {
			const [row] =
				await sql`SELECT COALESCE(SUM(ABS(amount_delta_minor)), 0)::int AS total FROM seller_earning_event
				WHERE earning_id = ${earningId} AND reason_code = 'refund'`;
			return row.total;
		};

		it('does not spread a partial refund over every seller; it holds and waits for an allocation', async () => {
			await apply('charge.refunded', refunded(3000), null);

			expect(await claw('e1')).toBe(0);
			expect(await claw('e2')).toBe(0);
			const core = await import('./refundAllocation');
			expect(await core.listAllocationsNeedingAction()).toMatchObject([
				{ unallocatedMinor: 3000, orderId: expect.any(Number) }
			]);
			const [{ open }] =
				await sql`SELECT count(*)::int AS open FROM order_balance_hold WHERE status = 'open'`;
			expect(open).toBe(1);
		});

		it('after an admin assigns the refund to seller A line, only seller A is clawed back', async () => {
			await apply('charge.refunded', refunded(3000), null);
			const allocation = await import('./refundAllocation');
			const [waiting] = await allocation.listAllocationsNeedingAction();

			const wrong = await allocation.allocateRefund({
				allocationId: waiting.allocationId,
				lines: [{ orderItemId: 1, amountMinor: 2000 }],
				actorId: 'admin',
				client: null
			});
			expect(wrong.ok).toBe(false);

			const done = await allocation.allocateRefund({
				allocationId: waiting.allocationId,
				lines: [{ orderItemId: 1, amountMinor: 3000 }],
				actorId: 'admin',
				client: null
			});
			expect(done).toEqual({ ok: true });

			// 3000 of A's 6000 line: half of A's 5520 net. B is untouched.
			expect(await claw('e1')).toBe(2760);
			expect(await claw('e2')).toBe(0);
			const [{ open }] =
				await sql`SELECT count(*)::int AS open FROM order_balance_hold WHERE status = 'open'`;
			expect(open).toBe(0);
		});

		it('a full refund still claws back every seller proportionally', async () => {
			await apply('charge.refunded', refunded(10000), null);
			expect(await claw('e1')).toBe(5520);
			expect(await claw('e2')).toBe(3680);
		});
	});
});
