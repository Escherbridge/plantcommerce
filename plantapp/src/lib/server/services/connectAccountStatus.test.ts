import { describe, expect, it } from 'vitest';
import { connectAccountSnapshot } from './connectAccountStatus';

describe('Connect account status', () => {
	it('marks transfers active only when a US v1 account says so', () => {
		expect(
			connectAccountSnapshot({
				id: 'acct_123',
				object: 'account',
				country: 'US',
				capabilities: { transfers: 'active' },
				requirements: { currently_due: [], disabled_reason: null }
			})
		).toEqual({
			stripeAccountId: 'acct_123',
			country: 'US',
			transfersActive: true,
			requirementsDue: false,
			disabledReason: null
		});
	});

	it('does not activate a non-US account or a pending capability', () => {
		expect(
			connectAccountSnapshot({
				id: 'acct_au',
				object: 'account',
				country: 'AU',
				capabilities: { transfers: 'active' },
				requirements: { currently_due: [] }
			})?.transfersActive
		).toBe(false);
		expect(
			connectAccountSnapshot({
				id: 'acct_pending',
				object: 'account',
				country: 'US',
				capabilities: { transfers: 'pending' },
				requirements: { currently_due: ['external_account'] }
			})
		).toMatchObject({ transfersActive: false, requirementsDue: true });
	});

	it('reads an Accounts v2 recipient capability', () => {
		expect(
			connectAccountSnapshot({
				id: 'acct_v2',
				object: 'v2.core.account',
				identity: { country: 'us' },
				configuration: {
					recipient: {
						capabilities: { stripe_balance: { stripe_transfers: { status: 'active' } } }
					}
				},
				requirements: { entries: [] }
			})
		).toMatchObject({
			stripeAccountId: 'acct_v2',
			country: 'US',
			transfersActive: true,
			requirementsDue: false
		});
	});
});
