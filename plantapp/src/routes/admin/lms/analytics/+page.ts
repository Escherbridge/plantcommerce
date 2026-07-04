import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const now = new Date();
		const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		const [dashboard, revenue, courses] = await Promise.all([
			trpc.lms.analytics.dashboard.query().catch(() => null),
			trpc.lms.analytics.revenueReport
				.query({
					startDate: thirtyDaysAgo.toISOString(),
					endDate: now.toISOString()
				})
				.catch(() => null),
			trpc.lms.course.adminList.query({ limit: 50 }).catch(() => [])
		]);

		return { dashboard, revenue, courses };
	} catch (error) {
		console.error('Error loading analytics:', error);
		return { dashboard: null, revenue: null, courses: [] };
	}
};
