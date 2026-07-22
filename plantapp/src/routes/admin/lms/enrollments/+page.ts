import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const courseResult = await trpc.lms.course.adminList.query({ limit: 100 });
		const courses = courseResult.courses;
		const firstCourseId = courses[0]?.id ?? null;
		const enrollments = firstCourseId
			? await trpc.lms.enrollment.courseEnrollments.query({ courseId: firstCourseId, limit: 100 })
			: { enrollments: [], total: 0 };
		return { courses, enrollments, selectedCourseId: firstCourseId };
	} catch (error) {
		console.error('Error loading enrollments:', error);
		return {
			courses: [],
			enrollments: { enrollments: [], total: 0 },
			selectedCourseId: null
		};
	}
};
