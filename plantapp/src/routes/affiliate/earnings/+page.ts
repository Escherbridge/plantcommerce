import type { PageLoad } from './$types';
import { requireAffiliate } from '$lib/loaders/protected';
import { trpc } from '$lib/trpc/client';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async (event) => {
	await requireAffiliate(event);

	try {
		const affiliate = await trpc(event).affiliate.getMyAffiliate.query();

		if (!affiliate) {
			throw redirect(303, '/affiliate/join');
		}

		let earnings = {
			totalEarnings: 0,
			pendingPayout: 0,
			currentMonthEarnings: 0,
			history: [],
			paymentMethod: null
		};

		try {
			earnings = await trpc(event).affiliate.getEarnings.query();
		} catch (e) {
			console.error('Error loading earnings:', e);
		}

		return {
			totalEarnings: earnings.totalEarnings || 0,
			pendingPayout: earnings.pendingPayout || 0,
			currentMonthEarnings: earnings.currentMonthEarnings || 0,
			earningsHistory: earnings.history || [],
			paymentMethod: earnings.paymentMethod
		};
	} catch (error) {
		if (error instanceof Response) {
			throw error;
		}
		console.error('Error loading earnings page:', error);
		throw redirect(303, '/affiliate/join');
	}
};
