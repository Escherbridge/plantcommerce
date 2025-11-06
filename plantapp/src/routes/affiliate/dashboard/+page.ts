import type { PageLoad } from './$types';
import { requireAffiliate } from '$lib/loaders/protected';
import { trpc } from '$lib/trpc/client';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async (event) => {
	await requireAffiliate(event);

	try {
		// Get affiliate data
		const affiliate = await trpc(event).affiliate.getMyAffiliate.query();

		if (!affiliate) {
			throw redirect(303, '/affiliate/join');
		}

		// Get affiliate stats
		let stats = {
			totalClicks: 0,
			totalConversions: 0,
			totalEarnings: 0,
			conversionRate: 0
		};

		try {
			stats = await trpc(event).affiliate.getStats.query();
		} catch (e) {
			console.error('Error loading stats:', e);
		}

		// Get recent activity
		let recentClicks = [];
		try {
			recentClicks = await trpc(event).affiliate.getRecentClicks.query({ limit: 10 });
		} catch (e) {
			console.error('Error loading recent clicks:', e);
		}

		return {
			affiliate,
			stats,
			recentClicks: recentClicks || []
		};
	} catch (error) {
		if (error instanceof Response) {
			throw error;
		}
		console.error('Error loading affiliate dashboard:', error);
		throw redirect(303, '/affiliate/join');
	}
};
