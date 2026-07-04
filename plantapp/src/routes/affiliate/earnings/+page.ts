import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { redirect, isRedirect } from '@sveltejs/kit';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const affiliate = await trpc.affiliate.getMyAffiliate.query();

		if (!affiliate) {
			throw redirect(303, '/affiliate/join');
		}

		let earnings: any = {
			totalEarnings: 0,
			pendingPayout: 0,
			currentMonthEarnings: 0,
			lastMonthEarnings: 0,
			history: [],
			paymentMethod: null
		};

		try {
			earnings = await trpc.affiliate.getEarnings.query();
		} catch (e) {
			console.error('Error loading earnings:', e);
		}

		return {
			totalEarnings: earnings.totalEarnings || 0,
			pendingPayout: earnings.pendingPayout || 0,
			currentMonthEarnings: earnings.currentMonthEarnings || 0,
			lastMonthEarnings: earnings.lastMonthEarnings || 0,
			earningsHistory: earnings.history || [],
			paymentMethod: earnings.paymentMethod
		};
	} catch (error) {
		if (isRedirect(error)) {
			throw error;
		}
		console.error('Error loading earnings page:', error);
		throw redirect(303, '/affiliate/join');
	}
};
