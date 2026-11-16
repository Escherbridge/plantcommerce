import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { getStripeClient } from '$lib/server/stripe';
import { AffiliateService } from './affiliate';
import { PayoutAccountService } from './payoutAccount';
import { SellerService } from './seller';

type AccountCreateParams = NonNullable<
	Parameters<InstanceType<typeof Stripe>['v2']['core']['accounts']['create']>[0]
>;
type AccountLinkCreateParams = NonNullable<
	Parameters<InstanceType<typeof Stripe>['v2']['core']['accountLinks']['create']>[0]
>;

/** Accounts v2 recipient account. Aevani prices the sale and covers losses. US only. */
export function recipientAccountCreateParams(input: {
	contactEmail: string;
	displayName: string;
	metadata: Record<string, string>;
}): AccountCreateParams {
	const email = input.contactEmail.trim().toLowerCase();
	if (!email.includes('@') || email.length > 200) {
		throw new Error('Payout setup needs an email address on the account');
	}
	const displayName = input.displayName.trim();
	if (!displayName) {
		throw new Error('Payout setup needs a display name');
	}
	return {
		display_name: displayName,
		contact_email: email,
		dashboard: 'express',
		identity: { country: 'us' },
		defaults: {
			responsibilities: {
				fees_collector: 'application',
				losses_collector: 'application'
			}
		},
		configuration: {
			recipient: {
				capabilities: {
					stripe_balance: {
						stripe_transfers: { requested: true }
					}
				}
			}
		},
		metadata: input.metadata,
		include: ['configuration.recipient', 'identity', 'requirements']
	};
}

export function recipientOnboardingLinkParams(input: {
	stripeAccountId: string;
	refreshUrl: string;
	returnUrl: string;
}): AccountLinkCreateParams {
	if (!input.stripeAccountId.startsWith('acct_')) {
		throw new Error('Payout setup is missing a Stripe account id');
	}
	return {
		account: input.stripeAccountId,
		use_case: {
			type: 'account_onboarding',
			account_onboarding: {
				configurations: ['recipient'],
				refresh_url: input.refreshUrl,
				return_url: input.returnUrl
			}
		}
	};
}

export function connectOnboardingEnabled(source: Record<string, string | undefined>): boolean {
	return source.CONNECT_ONBOARDING_ENABLED?.trim() === 'true';
}

export function connectWebhookSecret(source: Record<string, string | undefined>): string | null {
	const secret = source.STRIPE_CONNECT_WEBHOOK_SECRET?.trim();
	if (!secret || secret.startsWith('whsec_replace') || secret.startsWith('whsec_placeholder')) {
		return null;
	}
	return secret;
}

export type PayoutSetupResult =
	| { kind: 'disabled' }
	| { kind: 'unavailable' }
	| { kind: 'redirect'; url: string };

type ConnectClient = {
	v2: {
		core: {
			accounts: {
				create: (
					params: AccountCreateParams,
					options?: { idempotencyKey?: string }
				) => Promise<{ id: string }>;
			};
			accountLinks: {
				create: (params: AccountLinkCreateParams) => Promise<{ url: string }>;
			};
		};
	};
	accounts: {
		createLoginLink: (id: string) => Promise<{ url: string }>;
	};
};

async function localOwner(input: {
	userId: string;
	role: string;
	owner: 'seller' | 'affiliate';
}): Promise<
	| { ownerType: 'seller'; sellerId: number; displayName: string }
	| { ownerType: 'affiliate'; affiliateId: number; displayName: string }
	| null
> {
	if (input.owner === 'seller') {
		if (input.role !== 'seller') return null;
		const [existing] = await db
			.select()
			.from(table.seller)
			.where(eq(table.seller.userId, input.userId))
			.limit(1);
		const seller =
			existing ??
			(await SellerService.createForSellerUser(db, {
				userId: input.userId,
				displayName: 'Seller'
			}));
		return { ownerType: 'seller', sellerId: seller.id, displayName: seller.displayName };
	}

	try {
		const affiliate = await AffiliateService.requireActiveAffiliateByUserId(input.userId);
		return {
			ownerType: 'affiliate',
			affiliateId: affiliate.id,
			displayName: `Affiliate ${affiliate.affiliateCode}`
		};
	} catch {
		return null;
	}
}

function clientOrNull(explicit: ConnectClient | null | undefined): ConnectClient | null {
	if (explicit) return explicit;
	try {
		return getStripeClient() as unknown as ConnectClient;
	} catch {
		return null;
	}
}

/** Opens Stripe hosted onboarding. Does nothing, and does not call Stripe, when onboarding is off. */
export async function beginRecipientOnboarding(input: {
	enabled: boolean;
	userId: string;
	email: string;
	role: string;
	owner: 'seller' | 'affiliate';
	refreshUrl: string;
	returnUrl: string;
	stripeClient?: ConnectClient | null;
}): Promise<PayoutSetupResult> {
	if (!input.enabled) return { kind: 'disabled' };
	const owner = await localOwner(input);
	if (!owner) return { kind: 'unavailable' };
	const record = await PayoutAccountService.ensureLocal(db, owner);
	const stripe = clientOrNull(input.stripeClient);
	if (!stripe) return { kind: 'unavailable' };

	let stripeAccountId = record.stripeAccountId;
	if (!stripeAccountId) {
		const created = await stripe.v2.core.accounts.create(
			recipientAccountCreateParams({
				contactEmail: input.email,
				displayName: owner.displayName,
				metadata: {
					payout_account_id: record.id,
					owner_type: owner.ownerType
				}
			}),
			{ idempotencyKey: `connect-account:${record.id}` }
		);
		stripeAccountId = created.id;
		await PayoutAccountService.attachStripeAccount(record.id, stripeAccountId);
	}

	const link = await stripe.v2.core.accountLinks.create(
		recipientOnboardingLinkParams({
			stripeAccountId,
			refreshUrl: input.refreshUrl,
			returnUrl: input.returnUrl
		})
	);
	if (!link.url) return { kind: 'unavailable' };
	return { kind: 'redirect', url: link.url };
}

/** Express Dashboard login. Does nothing, and does not call Stripe, when onboarding is off. */
export async function beginExpressDashboard(input: {
	enabled: boolean;
	userId: string;
	owner: 'seller' | 'affiliate';
	stripeClient?: ConnectClient | null;
}): Promise<PayoutSetupResult> {
	if (!input.enabled) return { kind: 'disabled' };
	const owner = await localOwner({ ...input, role: input.owner });
	if (!owner) return { kind: 'unavailable' };
	const record = await PayoutAccountService.ensureLocal(db, owner);
	if (!record.stripeAccountId) return { kind: 'unavailable' };
	const stripe = clientOrNull(input.stripeClient);
	if (!stripe) return { kind: 'unavailable' };
	const link = await stripe.accounts.createLoginLink(record.stripeAccountId);
	if (!link.url) return { kind: 'unavailable' };
	return { kind: 'redirect', url: link.url };
}
