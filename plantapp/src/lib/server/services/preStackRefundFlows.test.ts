import postgres from 'postgres';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createPrestackDatabase, dropDatabase } from '$lib/server/db/testing/prestackDatabase';

// Refund and dispute events for a house-only order, through the platform webhook handler, on a pre-stack
// database with and without the affiliate ledger tables, every switch unset. Skipped without
// FLOW_TEST_DATABASE_URL.
const adminUrl = process.env.FLOW_TEST_DATABASE_URL;

const databaseModule = async () => {
	const url = process.env.PRESTACK_DATABASE_URL;
	if (!url) return { db: {}, sqlClient: null };
	const { default: postgres } = await import('postgres');
	const { drizzle } = await import('drizzle-orm/postgres-js');
	const schema = await import('$lib/server/db/schema');
	const sqlClient = postgres(url, { max: 5, onnotice: () => {} });
	return { sqlClient, db: drizzle(sqlClient, { schema }) };
};
vi.mock('$env/dynamic/private', () => ({ env: {} }));

describe.skipIf(!adminUrl)(
	'refunds and disputes on a pre-stack database',
	{ timeout: 60_000 },
	() => {
		describe.each([
			['without the affiliate ledger tables', false],
			['with the affiliate ledger tables', true]
		] as const)('%s', (_label, withLedger) => {
			const name = withLedger ? 'prestack_refund_with' : 'prestack_refund_without';
			let probe: postgres.Sql;

			beforeAll(async () => {
				const url = await createPrestackDatabase(adminUrl!, name, {
					withAffiliateLedgerTables: withLedger
				});
				process.env.PRESTACK_DATABASE_URL = url;
				probe = postgres(url, { max: 2, onnotice: () => {} });
				vi.resetModules();
				vi.doMock('$lib/server/db', databaseModule);
				const { ensureAdditiveMigrations } = await import('$lib/server/db/applyAdditiveMigrations');
				await ensureAdditiveMigrations();
				await probe`UPDATE "order" SET stripe_charge_id = 'ch_house' WHERE id = 1`;
			});

			afterAll(async () => {
				await probe?.end({ timeout: 2 });
				delete process.env.PRESTACK_DATABASE_URL;
				await dropDatabase(adminUrl!, name);
			});

			const deliver = async (id: string, type: string, object: Record<string, unknown>) => {
				const { StripeWebhookService } = await import('./stripeWebhook');
				const event = { id, type, data: { object } };
				return StripeWebhookService.processVerifiedEvent(
					event as never,
					Buffer.from(JSON.stringify(event))
				);
			};

			it('processes a partial refund, a lost dispute and a won dispute without touching optional tables', async () => {
				expect(
					await deliver('evt_r1', 'charge.refunded', { id: 'ch_house', amount_refunded: 1000 })
				).toBe('processed');
				expect(
					await deliver('evt_d1', 'charge.dispute.closed', {
						id: 'dp_1',
						charge: 'ch_house',
						amount: 2500,
						status: 'lost',
						reason: 'fraudulent'
					})
				).toBe('processed');
				expect(
					await deliver('evt_d2', 'charge.dispute.funds_reinstated', {
						id: 'dp_1',
						charge: 'ch_house',
						amount: 2500,
						status: 'won'
					})
				).toBe('processed');
				// A replay of the same delivery is a no-op.
				expect(
					await deliver('evt_r1', 'charge.refunded', { id: 'ch_house', amount_refunded: 1000 })
				).toBe('already_complete');
				const [holds] =
					await probe`SELECT count(*)::int AS open FROM order_balance_hold WHERE status = 'open'`;
				expect(holds.open).toBe(0);
			});
		});
	}
);
