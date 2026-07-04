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
	const { id } = event.params;

	try {
		const [curriculum, enrollments, gradingQueue] = await Promise.all([
			trpc.lms.curriculum.getCurriculum.query({ courseId: id }).catch(() => null),
			trpc.lms.enrollment.courseEnrollments.query({ courseId: id, limit: 100 }).catch(() => []),
			trpc.lms.quiz.gradingQueue.query({ courseId: id }).catch(() => [])
		]);

		return { user, courseId: id, curriculum, enrollments, gradingQueue };
	} catch (error) {
		console.error('Error loading instructor course:', error);
		return { user, courseId: id, curriculum: null, enrollments: [], gradingQueue: [] };
	}
};
