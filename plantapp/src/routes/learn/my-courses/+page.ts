import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);

	let enrollments: any[] = [];
	let stats: any = {
		coursesEnrolled: 0,
		coursesCompleted: 0,
		totalLearningMinutes: 0,
		averageQuizScore: 0,
		currentStreak: 0
	};

	try {
		enrollments = await trpc.lms.enrollment.myEnrollments.query();
	} catch (e) {
		console.error('Error loading enrollments:', e);
	}

	try {
		stats = await trpc.lms.analytics.myStats.query();
	} catch (e) {
		console.error('Error loading stats:', e);
	}

	return {
		enrollments: enrollments ?? [],
		stats
	};
};
