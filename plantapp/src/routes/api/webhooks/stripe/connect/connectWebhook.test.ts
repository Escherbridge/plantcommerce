import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/db', () => ({ db: {}, sqlClient: null }));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$lib/server/stripe', () => ({
	getStripeClient: () => {
		throw new Error('Stripe must not be called when the Connect webhook is off');
	}
}));

import { POST } from './+server';

describe('Connect webhook', () => {
	it('stays inert when the owner has not set the webhook secret', async () => {
		await expect(
			POST({
				request: new Request('https://aevani.com/api/webhooks/stripe/connect', { method: 'POST' })
			} as never)
		).rejects.toMatchObject({ status: 503 });
	});
});
