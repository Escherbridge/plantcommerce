import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { createCallerClient } from '$lib/trpc/client';
import { requireAuth } from '$lib/loaders/protected';

export const load: PageLoad = async (event) => {
	const user = await requireAuth(event);
	if (user.role !== 'instructor' && user.role !== 'admin') {
		throw redirect(303, '/');
	}

	const trpc = createCallerClient(event.fetch);
	try {
		const [courses, gradingQueue] = await Promise.all([
			trpc.lms.course.adminList
				.query({ limit: 50, instructorId: user.role === 'instructor' ? user.id : undefined })
				.catch(() => []),
			trpc.lms.quiz.gradingQueue.query({}).catch(() => [])
		]);

		return {
			user,
			courses,
			pendingGrades: Array.isArray(gradingQueue) ? gradingQueue.length : 0
		};
	} catch (error) {
		console.error('Error loading instructor dashboard:', error);
		return { user, courses: [], pendingGrades: 0 };
	}
};
