import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {
	beginExpressDashboard,
	beginRecipientOnboarding,
	connectOnboardingEnabled
} from './connectOnboarding';

export async function runPayoutSetup(input: {
	url: URL;
	user: { id: string; email: string; role: string } | null;
	owner: 'seller' | 'affiliate';
	action: 'setup' | 'dashboard';
}): Promise<{ notice: string }> {
	if (!input.user) return { notice: 'Sign in before setting up payouts.' };
	const enabled = connectOnboardingEnabled(env);
	const base = input.owner === 'seller' ? '/seller/payouts' : '/affiliate/payouts';
	const result =
		input.action === 'dashboard'
			? await beginExpressDashboard({
					enabled,
					userId: input.user.id,
					owner: input.owner
				})
			: await beginRecipientOnboarding({
					enabled,
					userId: input.user.id,
					email: input.user.email,
					role: input.user.role,
					owner: input.owner,
					refreshUrl: `${input.url.origin}${base}/refresh`,
					returnUrl: `${input.url.origin}${base}/return`
				});
	if (result.kind === 'redirect') throw redirect(303, result.url);
	if (result.kind === 'disabled') return { notice: 'Payout setup is not turned on.' };
	return { notice: 'Payout setup is not available.' };
}
