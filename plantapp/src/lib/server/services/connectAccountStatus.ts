export type ConnectAccountSnapshot = {
	stripeAccountId: string;
	country: 'US' | null;
	transfersActive: boolean;
	requirementsDue: boolean;
	disabledReason: string | null;
};

const REASON_CODE = /^[a-z0-9._-]{1,80}$/i;

function reasonCode(value: unknown): string | null {
	if (typeof value !== 'string' || !REASON_CODE.test(value)) return null;
	return value;
}

function countryCode(value: unknown): 'US' | null {
	return typeof value === 'string' && value.toUpperCase() === 'US' ? 'US' : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

/**
 * Read transfer status from an account.updated or v2.core.account payload.
 * Transfers stay inactive unless the payload says the capability is active.
 * Non-US countries are not stored.
 */
export function connectAccountSnapshot(object: unknown): ConnectAccountSnapshot | null {
	const account = asRecord(object);
	if (!account || typeof account.id !== 'string' || !account.id.startsWith('acct_')) return null;

	if (account.object === 'v2.core.account') {
		const configuration = asRecord(account.configuration);
		const recipient = asRecord(configuration?.recipient);
		const capabilities = asRecord(recipient?.capabilities);
		const balance = asRecord(capabilities?.stripe_balance);
		const transfers = asRecord(balance?.stripe_transfers);
		const identity = asRecord(account.identity);
		const requirements = asRecord(account.requirements);
		const entries = Array.isArray(requirements?.entries) ? requirements.entries : null;
		const closed = account.closed === true;
		const country = countryCode(identity?.country);
		return {
			stripeAccountId: account.id,
			country,
			transfersActive: !closed && country === 'US' && transfers?.status === 'active',
			requirementsDue: entries === null || entries.length > 0 || closed,
			disabledReason: closed ? 'closed' : null
		};
	}

	const capabilities = asRecord(account.capabilities);
	const requirements = asRecord(account.requirements);
	const currentlyDue = Array.isArray(requirements?.currently_due)
		? requirements.currently_due
		: null;
	const country = countryCode(account.country);
	return {
		stripeAccountId: account.id,
		country,
		transfersActive: country === 'US' && capabilities?.transfers === 'active',
		requirementsDue: currentlyDue === null || currentlyDue.length > 0,
		disabledReason: reasonCode(requirements?.disabled_reason)
	};
}
