import postgres from 'postgres';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createPrestackDatabase, dropDatabase } from '$lib/server/db/testing/prestackDatabase';

// The affiliate earnings page and the admin payout console on a pre-stack database, with and without the
// affiliate ledger tables, every switch unset. Skipped without FLOW_TEST_DATABASE_URL.
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
vi.mock('$lib/server/stripe', () => ({
	getStripeClient: () => {
		throw new Error('Stripe must not be reached with every switch unset');
	}
}));

describe.skipIf(!adminUrl)(
	'affiliate earnings and the payout console on a pre-stack database',
	{ timeout: 60_000 },
	() => {
		describe.each([
			['without the affiliate ledger tables', false],
			['with the affiliate ledger tables', true]
		] as const)('%s', (_label, withLedger) => {
			const name = withLedger ? 'prestack_console_with' : 'prestack_console_without';
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
				await probe`INSERT INTO affiliate (user_id, affiliate_code) VALUES ('u1', 'FERN1')`;
			});

			afterAll(async () => {
				await probe?.end({ timeout: 2 });
				delete process.env.PRESTACK_DATABASE_URL;
				await dropDatabase(adminUrl!, name);
			});

			it('shows an existing affiliate zero earnings without reading the commission tables', async () => {
				const page = await import('../../../routes/affiliate/earnings/+page.server');
				const result = (await (page.load as unknown as (event: unknown) => Promise<unknown>)({
					locals: { user: { id: 'u1', role: 'affiliate' } }
				})) as { lines: { label: string; amount: string }[] };
				expect(result.lines.map((line) => line.amount)).toEqual([
					'$0.00',
					'$0.00',
					'$0.00',
					'$0.00'
				]);
			});

			it('loads the admin console, reconciliation and CSV for an admin', async () => {
				const admin = { id: 'admin', role: 'admin' };
				const event = { locals: { user: admin } };
				const consolePage = await import('../../../routes/admin/payouts/+page.server');
				const data = (await (consolePage.load as unknown as (e: unknown) => Promise<unknown>)(
					event
				)) as { pending: string; reservedDebt: { count: number }; allocations: unknown[] };
				expect(data.pending).toBe('$0.00');
				expect(data.reservedDebt.count).toBe(0);
				expect(data.allocations).toEqual([]);

				const reconciliation = await import(
					'../../../routes/admin/payouts/reconciliation/+page.server'
				);
				await (reconciliation.load as unknown as (e: unknown) => Promise<unknown>)(event);
				const exportRoute = await import('../../../routes/admin/payouts/export/+server');
				const response = await (exportRoute.GET as unknown as (e: unknown) => Promise<Response>)(
					event
				);
				expect(response.status).toBe(200);
			});
		});
	}
);
