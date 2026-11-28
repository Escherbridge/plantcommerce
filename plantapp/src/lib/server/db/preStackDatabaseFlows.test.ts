import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createPrestackDatabase, dropDatabase, tableExists } from './testing/prestackDatabase';

// The startup applier against a database shaped like production before this stack, with and without the
// affiliate ledger tables that only source-only artifacts 0006/0007 create. Skipped unless
// FLOW_TEST_DATABASE_URL points at a throwaway Postgres (the CI job provides one).
const adminUrl = process.env.FLOW_TEST_DATABASE_URL;

// Re-mocked on every fresh module load so each boot gets its own client on the current target database.
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

const drizzleDir = join(dirname(fileURLToPath(import.meta.url)), '../../../../drizzle');

/** Tables the stack's own migration files create, whichever PR of the stack this runs on. */
function stackTables(): string[] {
	const tables = new Set<string>();
	for (const file of readdirSync(drizzleDir)) {
		if (!/^00(1[2-9])_.*\.sql$/.test(file)) continue;
		const source = readFileSync(join(drizzleDir, file), 'utf8');
		for (const match of source.matchAll(/CREATE TABLE IF NOT EXISTS "public"\."([a-z_]+)"/g)) {
			tables.add(match[1]);
		}
	}
	return [...tables];
}

function stackAltersOrder(): boolean {
	return readdirSync(drizzleDir)
		.filter((file) => /^001[2-9]_.*[.]sql$/.test(file))
		.some((file) =>
			/ALTER TABLE "public"[.]"order"/.test(readFileSync(join(drizzleDir, file), 'utf8'))
		);
}

async function freshModules() {
	vi.resetModules();
	vi.doMock('$lib/server/db', databaseModule);
	return {
		db: await import('$lib/server/db'),
		applier: await import('./applyAdditiveMigrations')
	};
}

describe.skipIf(!adminUrl)('startup applier on a pre-stack database', { timeout: 60_000 }, () => {
	describe.each([
		['without the affiliate ledger tables', false],
		['with the affiliate ledger tables', true]
	] as const)('%s', (_label, withLedger) => {
		const name = withLedger ? 'prestack_with_ledger' : 'prestack_without_ledger';
		let url = '';
		let probe: postgres.Sql;

		beforeAll(async () => {
			url = await createPrestackDatabase(adminUrl!, name, {
				withAffiliateLedgerTables: withLedger
			});
			process.env.PRESTACK_DATABASE_URL = url;
			probe = postgres(url, { max: 2, onnotice: () => {} });
		});

		afterAll(async () => {
			await probe?.end({ timeout: 2 });
			delete process.env.PRESTACK_DATABASE_URL;
			await dropDatabase(adminUrl!, name);
		});

		it('applies, creates the stack tables, and is idempotent on a second boot', async () => {
			const first = await freshModules();
			await first.applier.ensureAdditiveMigrations();
			await first.db.sqlClient?.end({ timeout: 2 });
			for (const table of stackTables()) {
				expect(await tableExists(probe, table), `${table} exists`).toBe(true);
			}

			const second = await freshModules();
			await second.applier.ensureAdditiveMigrations();
			await second.db.sqlClient?.end({ timeout: 2 });
			// The ledger tables are never created by the applier, and never required by it.
			expect(await tableExists(probe, 'affiliate_commission_ledger')).toBe(withLedger);
		});

		it('keeps the live paths working with every switch unset', async () => {
			const { db, applier } = await freshModules();
			await applier.ensureAdditiveMigrations();
			const { OrderService } = await import('$lib/server/services/order');

			const order = await OrderService.getOrderById(1);
			expect(order.orderNumber).toBe('A-1');
			await OrderService.updateOrderStatus(1, 'shipped');
			await OrderService.updateOrderStatus(1, 'delivered');
			const [row] = await probe`SELECT status FROM "order" WHERE id = 1`;
			expect(row).toMatchObject({ status: 'delivered' });

			// Registration without an invite stays a plain failure with field errors, no invite tables needed.
			const register = await import('../../../routes/register/+page.server');
			const body = new FormData();
			const result = await (
				register.actions.default as unknown as (event: unknown) => Promise<{ status: number }>
			)({
				request: new Request('http://localhost/register', { method: 'POST', body }),
				url: new URL('http://localhost/register')
			});
			expect(result.status).toBe(400);
			await db.sqlClient?.end({ timeout: 2 });
		});
	});

	// Only meaningful once a stack migration alters `order`; earlier PRs add nothing that needs the lock.
	it.skipIf(!stackAltersOrder())(
		'gives up after the lock timeout instead of hanging, and a later request retries cleanly',
		async () => {
			const name = 'prestack_lock_timeout';
			const url = await createPrestackDatabase(adminUrl!, name, {
				withAffiliateLedgerTables: false
			});
			process.env.PRESTACK_DATABASE_URL = url;
			const holder = postgres(url, { max: 1, onnotice: () => {} });
			try {
				let release: () => void = () => {};
				const held = new Promise<void>((resolve) => (release = resolve));
				const locked = holder.begin(async (tx) => {
					await tx`LOCK TABLE "order" IN ACCESS EXCLUSIVE MODE`;
					await held;
				});
				await new Promise((resolve) => setTimeout(resolve, 300));

				const blocked = await freshModules();
				await expect(blocked.applier.ensureAdditiveMigrations()).rejects.toThrow(/lock timeout/i);
				await blocked.db.sqlClient?.end({ timeout: 2 });

				release();
				await locked;
				const retried = await freshModules();
				await retried.applier.ensureAdditiveMigrations();
				await retried.db.sqlClient?.end({ timeout: 2 });
			} finally {
				await holder.end({ timeout: 2 });
				delete process.env.PRESTACK_DATABASE_URL;
				await dropDatabase(adminUrl!, name);
			}
		},
		30_000
	);

	it('does not take a table lock on later boots once the columns exist', async () => {
		const name = 'prestack_no_lock';
		const url = await createPrestackDatabase(adminUrl!, name, { withAffiliateLedgerTables: true });
		process.env.PRESTACK_DATABASE_URL = url;
		const holder = postgres(url, { max: 1, onnotice: () => {} });
		try {
			const first = await freshModules();
			await first.applier.ensureAdditiveMigrations();
			await first.db.sqlClient?.end({ timeout: 2 });

			let release: () => void = () => {};
			const held = new Promise<void>((resolve) => (release = resolve));
			const locked = holder.begin(async (tx) => {
				await tx`LOCK TABLE "order", product, order_item IN ACCESS EXCLUSIVE MODE`;
				await held;
			});
			await new Promise((resolve) => setTimeout(resolve, 300));

			const second = await freshModules();
			await second.applier.ensureAdditiveMigrations();
			await second.db.sqlClient?.end({ timeout: 2 });
			release();
			await locked;
		} finally {
			await holder.end({ timeout: 2 });
			delete process.env.PRESTACK_DATABASE_URL;
			await dropDatabase(adminUrl!, name);
		}
	}, 30_000);
});
