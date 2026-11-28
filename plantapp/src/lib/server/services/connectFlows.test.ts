import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Real-Postgres Connect webhook flow. Skipped unless FLOW_TEST_DATABASE_URL points at a throwaway database.
const databaseUrl = process.env.FLOW_TEST_DATABASE_URL;

vi.mock('$lib/server/db', async () => {
	const url = process.env.FLOW_TEST_DATABASE_URL;
	if (!url) return { db: {}, sqlClient: null };
	const { default: postgres } = await import('postgres');
	const { drizzle } = await import('drizzle-orm/postgres-js');
	const schema = await import('$lib/server/db/schema');
	const sqlClient = postgres(url, { max: 5, onnotice: () => {} });
	return { sqlClient, db: drizzle(sqlClient, { schema }) };
});

describe.skipIf(!databaseUrl)('connect webhook on Postgres', { timeout: 30_000 }, () => {
	let sql: Awaited<typeof import('$lib/server/db')>['sqlClient'];

	beforeEach(async () => {
		vi.resetModules();
		sql = (await import('$lib/server/db')).sqlClient;
		await sql.unsafe(`TRUNCATE stripe_webhook_event CASCADE`);
	});

	afterAll(async () => {
		await sql?.end({ timeout: 2 });
	});

	it('acknowledges a v2 thin event (no data object) instead of throwing into a retry loop', async () => {
		const { StripeWebhookService } = await import('./stripeWebhook');
		const thin = {
			id: 'evt_thin_1',
			type: 'v2.core.account[configuration.recipient].capability_status_updated',
			related_object: { id: 'acct_1', type: 'v2.core.account' }
		};
		const body = Buffer.from(JSON.stringify(thin));

		await expect(StripeWebhookService.processConnectEvent(thin as never, body)).resolves.toBe(
			'ignored'
		);
		await expect(StripeWebhookService.processConnectEvent(thin as never, body)).resolves.toBe(
			'already_complete'
		);
	});
});
