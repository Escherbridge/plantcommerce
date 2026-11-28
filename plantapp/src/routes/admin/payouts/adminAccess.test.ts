import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/db', () => ({ db: {}, sqlClient: null }));
vi.mock('$lib/server/stripe', () => ({
	getStripeClient: () => {
		throw new Error('Stripe must not be reached by a denied request');
	}
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));

const refused = { status: 403 };

async function denied(call: () => unknown) {
	await expect(Promise.resolve().then(call)).rejects.toMatchObject(refused);
}

const visitors = [
	['a signed-out visitor', null],
	['a customer', { id: 'u', role: 'customer' }],
	['a seller', { id: 's', role: 'seller' }],
	['an affiliate', { id: 'a', role: 'affiliate' }]
] as const;

describe.each(visitors)('payout console for %s', (_label, user) => {
	const event = (extra: Record<string, unknown> = {}) =>
		({
			locals: { user },
			request: new Request('http://localhost/admin/payouts', {
				method: 'POST',
				body: new FormData()
			}),
			...extra
		}) as never;

	it('refuses the console page, every money action, the CSV and reconciliation', async () => {
		const page = await import('./+page.server');
		await denied(() => page.load(event()));
		for (const name of ['default', 'transfers', 'batch', 'approve', 'sweep', 'allocate'] as const) {
			await denied(() => (page.actions as Record<string, (e: never) => unknown>)[name](event()));
		}
		const exportRoute = await import('./export/+server');
		await denied(() => exportRoute.GET(event()));
		const reconciliation = await import('./reconciliation/+page.server');
		await denied(() => reconciliation.load(event()));
	});
});
