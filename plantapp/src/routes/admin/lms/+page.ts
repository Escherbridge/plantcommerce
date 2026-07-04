import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const [stats, courses] = await Promise.all([
			trpc.lms.analytics.dashboard.query().catch(() => null),
			trpc.lms.course.adminList.query({ limit: 5 }).catch(() => [])
		]);
		return { stats, recentCourses: courses };
	} catch (error) {
		console.error('Error loading LMS dashboard:', error);
		return { stats: null, recentCourses: [] };
	}
};
