import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { redirect, isRedirect } from '@sveltejs/kit';
import { getUser } from '$lib/loaders/protected';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		// Get current user
		const user = await getUser(event);

		// Get affiliate data
		const affiliate = await trpc.affiliate.getMyAffiliate.query();

		// If user is admin, allow viewing dashboard without affiliate record
		if (!affiliate && user?.role !== 'admin') {
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
			stats = await trpc.affiliate.getStats.query();
		} catch (e) {
			console.error('Error loading stats:', e);
		}

		// Get top performing links (previously "recent clicks")
		let recentClicks: any[] = [];
		try {
			recentClicks = await trpc.affiliate.getRecentClicks.query({ limit: 10 });
		} catch (e) {
			console.error('Error loading recent clicks:', e);
		}

		return {
			affiliate,
			stats,
			recentClicks: recentClicks || [],
			isAdmin: user?.role === 'admin'
		};
	} catch (error) {
		if (isRedirect(error)) {
			throw error;
		}
		console.error('Error loading affiliate dashboard:', error);
		throw redirect(303, '/affiliate/join');
	}
};
