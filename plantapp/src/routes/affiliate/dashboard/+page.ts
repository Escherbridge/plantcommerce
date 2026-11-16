import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { redirect, isRedirect } from '@sveltejs/kit';
import { getUser } from '$lib/loaders/protected';
import { affiliatePortalStatus } from '$lib/affiliate/application';

const emptyStats = {
	totalClicks: 0,
	totalConversions: 0,
	conversionRate: 0
};

/** Active affiliates and admins can open the dashboard. Everyone else returns to the application. */
export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const user = await getUser(event);
	try {
		const affiliate = await trpc.affiliate.getMyAffiliate.query();
		const status = affiliatePortalStatus(affiliate);
		if (status !== 'active' && user?.role !== 'admin') {
			throw redirect(303, '/affiliate/join');
		}

		if (status !== 'active') {
			return { affiliate: null, isAdmin: user?.role === 'admin', stats: emptyStats, links: [] };
		}

		let stats = emptyStats;
		let links: Awaited<ReturnType<typeof trpc.affiliate.getMyLinks.query>> = [];
		try {
			const loaded = await trpc.affiliate.getStats.query();
			stats = {
				totalClicks: loaded.totalClicks,
				totalConversions: loaded.totalConversions,
				conversionRate: loaded.conversionRate
			};
		} catch (error) {
			console.error('Error loading affiliate stats:', error);
		}
		try {
			links = await trpc.affiliate.getMyLinks.query();
		} catch (error) {
			console.error('Error loading affiliate links:', error);
		}

		return { affiliate, isAdmin: user?.role === 'admin', stats, links };
	} catch (error) {
		if (isRedirect(error)) throw error;
		console.error('Error loading affiliate dashboard:', error);
		throw redirect(303, '/affiliate/join');
	}
};
