import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { formatMinor } from '$lib/server/services/ledgerBuckets';
import { loadSellerBuckets } from '$lib/server/services/payoutConsole';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(303, `/login?redirect=${encodeURIComponent(url.pathname)}`);
	}
	if (locals.user.role !== 'seller') throw redirect(303, '/');
	const buckets = await loadSellerBuckets(locals.user.id);
	const amounts = buckets ?? {
		pendingMinor: 0,
		heldMinor: 0,
		releasedMinor: 0,
		paidMinor: 0
	};
	return {
		lines: [
			{ label: 'Pending', amount: formatMinor(amounts.pendingMinor) },
			{ label: 'Held', amount: formatMinor(amounts.heldMinor) },
			{ label: 'Released', amount: formatMinor(amounts.releasedMinor) },
			{ label: 'Paid', amount: formatMinor(amounts.paidMinor) }
		]
	};
};
