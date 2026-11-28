import { afterAll, describe, expect, it, vi } from 'vitest';

// Seeded property test over the whole money path on real Postgres: charge, seller transfer (with a crash and a
// resume), partial and full refunds, disputes lost and won with a fee, manual line allocation, and payout runs, on
// one- and two-seller orders. After every step the single ledger reader must agree with the fake Stripe.
// Skipped unless FLOW_TEST_DATABASE_URL points at a throwaway database.
const databaseUrl = process.env.FLOW_TEST_DATABASE_URL;
const SEEDS = Number(process.env.LEDGER_PROPERTY_SEEDS ?? 40);

vi.mock('$lib/server/db', async () => {
	const url = process.env.FLOW_TEST_DATABASE_URL;
	if (!url) return { db: {}, sqlClient: null };
	const { default: postgres } = await import('postgres');
	const { drizzle } = await import('drizzle-orm/postgres-js');
	const schema = await import('$lib/server/db/schema');
	const sqlClient = postgres(url, { max: 10, onnotice: () => {} });
	return { sqlClient, db: drizzle(sqlClient, { schema }) };
});

function makeStripe() {
	const transfers: {
		id: string;
		amount: number;
		destination: string;
		transfer_group?: string;
		metadata: Record<string, string>;
	}[] = [];
	const reversals: {
		id: string;
		transferId: string;
		amount: number;
		metadata: Record<string, string>;
	}[] = [];
	const transferKeys = new Map<string, string>();
	const reversalKeys = new Map<string, string>();
	const state = { crashNextCreate: false };
	const client = {
		transfers: {
			create: async (
				params: {
					amount: number;
					destination: string;
					transfer_group?: string;
					metadata?: Record<string, string>;
				},
				options?: { idempotencyKey?: string }
			) => {
				const key = options?.idempotencyKey;
				if (key && transferKeys.has(key)) return { id: transferKeys.get(key)! };
				const id = `tr_${transfers.length + 1}`;
				transfers.push({
					id,
					amount: params.amount,
					destination: params.destination,
					transfer_group: params.transfer_group,
					metadata: params.metadata ?? {}
				});
				if (key) transferKeys.set(key, id);
				if (state.crashNextCreate) {
					state.crashNextCreate = false;
					throw Object.assign(new Error('socket hang up'), { type: 'StripeConnectionError' });
				}
				return { id };
			},
			list: async (params: { transfer_group: string; destination?: string }) => ({
				data: transfers
					.filter(
						(t) =>
							t.transfer_group === params.transfer_group &&
							(!params.destination || t.destination === params.destination)
					)
					.map((t) => ({ id: t.id, amount: t.amount, metadata: t.metadata })),
				has_more: false
			}),
			createReversal: async (
				transferId: string,
				params: { amount?: number; metadata?: Record<string, string> },
				options?: { idempotencyKey?: string }
			) => {
				const key = options?.idempotencyKey;
				if (key && reversalKeys.has(key)) return { id: reversalKeys.get(key)! };
				const id = `trr_${reversals.length + 1}`;
				reversals.push({
					id,
					transferId,
					amount: params.amount ?? 0,
					metadata: params.metadata ?? {}
				});
				if (key) reversalKeys.set(key, id);
				return { id };
			},
			listReversals: async (transferId: string) => ({
				data: reversals
					.filter((r) => r.transferId === transferId)
					.map((r) => ({ id: r.id, amount: r.amount, metadata: r.metadata })),
				has_more: false
			})
		}
	};
	return { client, transfers, reversals, state };
}

function seededRandom(seed: number) {
	let value = seed * 2654435761 + 12345;
	return () => {
		value = (value * 1664525 + 1013904223) % 4294967296;
		return value / 4294967296;
	};
}

describe.skipIf(!databaseUrl)('ledger property flows on Postgres', { timeout: 300_000 }, () => {
	let sql: Awaited<typeof import('$lib/server/db')>['sqlClient'];

	afterAll(async () => {
		await sql?.end({ timeout: 2 });
	});

	it(`holds the ledger invariants over ${SEEDS} seeded sequences`, async () => {
		const dbModule = await import('$lib/server/db');
		sql = dbModule.sqlClient;
		const { db } = dbModule;
		const jobs = await import('./payoutJobs');
		const { applyMoneyEvent } = await import('./refundApply');
		const allocation = await import('./refundAllocation');
		const ledger = await import('./sellerLedgerBalance');
		const { proportionalShare } = await import('./refundClawback');
		const env = { SELLER_TRANSFERS_ENABLED: 'true', PAYOUT_HOLD_DAYS_AFTER_DELIVERY: '14' };

		for (let seed = 1; seed <= SEEDS; seed += 1) {
			const random = seededRandom(seed);
			const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)];
			const twoSellers = seed % 2 === 0;
			const stripe = makeStripe();

			// ---- charge: one order, one or two sellers, earnings released, accounts active ----
			await sql.unsafe(
				`TRUNCATE "order", "user", seller, payout_account, seller_earning, seller_earning_event, order_balance_hold,
				 payout_transfer, order_item, product, refund_allocation, refund_allocation_line CASCADE`
			);
			await sql`INSERT INTO product (id, name, slug, sku, price, category_id) VALUES (1,'p','p','p','1.00',1)`;
			const [order] =
				await sql`INSERT INTO "order" (order_number, total_amount, subtotal_amount, customer_email, stripe_charge_id, transfer_group)
				VALUES ('A-1', '100.00', '100.00', 'c@example.com', 'ch_1', 'draft-1') RETURNING id`;
			const lines = twoSellers ? [6000, 4000] : [10000];
			const earningIds: string[] = [];
			for (let index = 0; index < lines.length; index += 1) {
				const userId = `u${index + 1}`;
				await sql`INSERT INTO "user" (id, username, email, password_hash) VALUES (${userId}, ${userId}, ${userId + '@example.com'}, 'x')`;
				const [seller] =
					await sql`INSERT INTO seller (user_id, display_name) VALUES (${userId}, ${userId}) RETURNING id`;
				await sql`INSERT INTO payout_account (id, owner_type, seller_id, stripe_account_id, transfers_active)
					VALUES (${'pa' + index}, 'seller', ${seller.id}, ${'acct_' + index}, true)`;
				const fee = Math.round(lines[index] * 0.08);
				const earningId = `e${index + 1}`;
				earningIds.push(earningId);
				await sql`INSERT INTO seller_earning (id, order_id, seller_id, currency, line_total_minor, fee_bps, fee_minor, net_minor)
					VALUES (${earningId}, ${order.id}, ${seller.id}, 'usd', ${lines[index]}, 800, ${fee}, ${lines[index] - fee})`;
				await sql`INSERT INTO seller_earning_event (id, earning_id, event_type, amount_delta_minor, currency, event_reference)
					VALUES (${'p' + earningId}, ${earningId}, 'pending', ${lines[index] - fee}, 'usd', ${'seller-earning:' + earningId + ':pending'}),
					       (${'r' + earningId}, ${earningId}, 'released', 0, 'usd', ${'seller-earning:' + earningId + ':released'})`;
				await sql`INSERT INTO order_item (id, order_id, product_id, product_name, product_sku, quantity, unit_price, total_price, seller_id)
					VALUES (${index + 1}, ${order.id}, 1, ${'item' + index}, 's', 1, ${(lines[index] / 100).toFixed(2)}, ${(lines[index] / 100).toFixed(2)}, ${seller.id})`;
			}

			// ---- model of what has been asked of the system ----
			let refundedCumulative = 0;
			const disputes: {
				id: string;
				amount: number;
				lost: boolean;
				won: boolean;
				feePaid: boolean;
			}[] = [];
			let disputeCounter = 0;

			const events = async (earningId: string) => ledger.loadEarningEvents(db, earningId);
			const balances = async () => {
				const map: Record<string, ReturnType<typeof ledger.earningBalance>> = {};
				for (const id of earningIds) map[id] = ledger.earningBalance(await events(id));
				return map;
			};

			const check = async (label: string) => {
				const all = await balances();
				let clawedTotal = 0;
				let netTotal = 0;
				let feeTotal = 0;
				for (const id of earningIds) {
					const balance = all[id];
					const where = `seed ${seed} after ${label} (${id})`;
					expect(balance.clawedBackMinor, `${where}: clawedBack <= net`).toBeLessThanOrEqual(
						balance.netMinor
					);
					expect(balance.clawedBackMinor, `${where}: clawedBack >= 0`).toBeGreaterThanOrEqual(0);
					expect(
						balance.reservedDebtMinor,
						`${where}: reserved counted once inside clawedBack`
					).toBeLessThanOrEqual(balance.clawedBackMinor);
					expect(balance.reservedDebtMinor, `${where}: reserved >= 0`).toBeGreaterThanOrEqual(0);
					clawedTotal += balance.clawedBackMinor;
					netTotal += balance.netMinor;
					feeTotal += balance.feeDebtMinor;
				}
				// No seller is debited more than the refunded share: exposure is the refund total plus disputes still lost.
				const exposure = Math.min(
					10000,
					refundedCumulative +
						disputes.filter((d) => d.lost && !d.won).reduce((sum, d) => sum + d.amount, 0)
				);
				const allowed = proportionalShare(netTotal, exposure, 10000) + earningIds.length * 2;
				expect(
					clawedTotal,
					`seed ${seed} after ${label}: clawed back <= refunded share`
				).toBeLessThanOrEqual(allowed);
				const feeAllowed = disputes.filter((d) => d.lost && !d.won && d.feePaid).length * 1500;
				expect(feeTotal, `seed ${seed} after ${label}: fee debt <= fees owed`).toBeLessThanOrEqual(
					feeAllowed
				);

				// Money at Stripe equals what the ledger says was sent, once nothing is mid-flight.
				const pendingRows =
					await sql`SELECT count(*)::int AS count FROM payout_transfer WHERE status = 'pending'`;
				if (pendingRows[0].count === 0) {
					const [sent] =
						await sql`SELECT COALESCE(SUM(amount_minor), 0)::int AS total FROM payout_transfer WHERE kind = 'seller' AND status = 'succeeded'`;
					const reversedGross = Object.values(all).reduce(
						(sum, balance) => sum + balance.stripeReversedGrossMinor,
						0
					);
					const stripeNet =
						stripe.transfers.reduce((sum, t) => sum + t.amount, 0) -
						stripe.reversals.reduce((sum, r) => sum + r.amount, 0);
					expect(
						stripeNet,
						`seed ${seed} after ${label}: Stripe net equals ledger sent minus reversed`
					).toBe(sent.total - reversedGross);
				}
			};

			// ---- steps ----
			const apply = (type: string, object: unknown) =>
				applyMoneyEvent(type, object, random() < 0.7 ? (stripe.client as never) : null);
			const payout = async () => {
				await sql`UPDATE payout_transfer SET updated_at = now() - interval '1 hour' WHERE status = 'pending'`;
				stripe.state.crashNextCreate = random() < 0.2;
				await jobs.runSellerTransfers(env, stripe.client as never);
				stripe.state.crashNextCreate = false;
			};
			const allocateWaiting = async (onlyAllocationId?: string) => {
				const needs = (await allocation.listAllocationsNeedingAction()).filter(
					(candidate) => !onlyAllocationId || candidate.allocationId === onlyAllocationId
				);
				if (needs.length === 0) return;
				const need = pick(needs);
				let left = need.unallocatedMinor;
				const chosen: { orderItemId: number; amountMinor: number }[] = [];
				for (const item of [...need.items].sort(() => random() - 0.5)) {
					const take = Math.min(left, item.remainingMinor);
					if (take > 0) {
						chosen.push({ orderItemId: item.id, amountMinor: take });
						left -= take;
					}
				}
				if (left !== 0) return;
				await allocation.allocateRefund({
					allocationId: need.allocationId,
					lines: chosen,
					actorId: 'admin',
					client: random() < 0.7 ? (stripe.client as never) : null
				});
			};
			const loseDispute = async () => {
				disputeCounter += 1;
				const dispute = {
					id: `dp_${disputeCounter}`,
					amount: pick([1000, 2000, 3000, 4000]),
					lost: true,
					won: false,
					feePaid: random() < 0.5
				};
				disputes.push(dispute);
				await apply('charge.dispute.closed', {
					id: dispute.id,
					charge: 'ch_1',
					amount: dispute.amount,
					status: 'lost',
					reason: dispute.feePaid ? 'product_not_received' : 'fraudulent',
					balance_transactions: [{ fee: 1500 }]
				});
				return dispute;
			};
			const winDispute = (dispute: (typeof disputes)[number]) => {
				dispute.won = true;
				return applyMoneyEvent(
					'charge.dispute.funds_reinstated',
					{ id: dispute.id, charge: 'ch_1', amount: dispute.amount, status: 'won' },
					stripe.client as never
				);
			};

			await check('charge');
			const steps = 6 + Math.floor(random() * 8);
			for (let step = 0; step < steps; step += 1) {
				const roll = random();
				let label: string;
				if (roll < 0.25) {
					label = 'payout';
					await payout();
				} else if (roll < 0.5) {
					label = 'refund';
					refundedCumulative = Math.min(10000, refundedCumulative + pick([500, 1000, 2000, 3000]));
					await apply('charge.refunded', { id: 'ch_1', amount_refunded: refundedCumulative });
				} else if (roll < 0.62) {
					label = 'dispute lost';
					await loseDispute();
				} else if (roll < 0.72) {
					label = 'dispute won';
					const lost = disputes.filter((d) => d.lost && !d.won);
					if (lost.length > 0) await winDispute(pick(lost));
				} else if (roll < 0.9) {
					label = 'allocate';
					await allocateWaiting();
				} else {
					// A won dispute returns the sellers exactly to the position before it.
					label = 'dispute round trip';
					for (let attempt = 0; attempt < 6; attempt += 1) await allocateWaiting();
					const before = await balances();
					const dispute = await loseDispute();
					const [needed] =
						await sql`SELECT id FROM refund_allocation WHERE source_key = ${dispute.id} AND status = 'needs_allocation'`;
					if (needed) await allocateWaiting(needed.id);
					await winDispute(dispute);
					const after = await balances();
					for (const id of earningIds) {
						expect(
							after[id].clawedBackMinor,
							`seed ${seed}: ${id} clawedBack back to pre-dispute`
						).toBe(before[id].clawedBackMinor);
						expect(after[id].feeDebtMinor, `seed ${seed}: ${id} fee debt back to pre-dispute`).toBe(
							before[id].feeDebtMinor
						);
						expect(
							after[id].reservedDebtMinor,
							`seed ${seed}: ${id} reserved back to pre-dispute`
						).toBe(before[id].reservedDebtMinor);
					}
				}
				await check(label);
			}
			// Settle everything that can be settled, then the invariants must still hold.
			await payout();
			await payout();
			await check('final payouts');
		}
	});
});
