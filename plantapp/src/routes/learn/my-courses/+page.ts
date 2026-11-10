import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

const emptyStats = {
	coursesEnrolled: 0,
	coursesCompleted: 0,
	totalLearningMinutes: 0,
	averageQuizScore: 0,
	currentStreak: 0
};

function loadErrorMessage(cause: unknown): string {
	return cause instanceof Error ? cause.message : 'Request failed';
}

export const load: PageLoad = async (event) => {
	const { user } = await event.parent();
	if (!user) {
		return { signedOut: true, enrollments: [], stats: emptyStats };
	}

	const trpc = createCallerClient(event.fetch);
	let enrollments: any[] = [];
	let stats: any = emptyStats;

	try {
		enrollments = await trpc.lms.enrollment.myEnrollments.query();
	} catch (cause) {
		console.error('Error loading enrollments:', loadErrorMessage(cause));
	}

	try {
		stats = await trpc.lms.analytics.myStats.query();
	} catch (cause) {
		console.error('Error loading stats:', loadErrorMessage(cause));
	}

	return {
		signedOut: false,
		enrollments: enrollments ?? [],
		stats
	};
};
