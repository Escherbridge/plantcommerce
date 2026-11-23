import type { PageServerLoad } from './$types';
import { AffiliateService } from '$lib/server/services/affiliate';
import { formatMinor } from '$lib/server/services/ledgerBuckets';
import { loadAffiliateBuckets } from '$lib/server/services/payoutConsole';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { lines: [] as { label: string; amount: string }[] };
	const affiliate = await AffiliateService.getAffiliateByUserId(locals.user.id);
	if (!affiliate) return { lines: [] };
	const buckets = await loadAffiliateBuckets(affiliate.id);
	return {
		lines: [
			{ label: 'Pending', amount: formatMinor(buckets.pendingMinor) },
			{ label: 'Held', amount: formatMinor(buckets.heldMinor) },
			{ label: 'Released', amount: formatMinor(buckets.releasedMinor) },
			{ label: 'Paid', amount: formatMinor(buckets.paidMinor) }
		]
	};
};
