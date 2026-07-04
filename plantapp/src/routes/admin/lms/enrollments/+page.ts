import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const courses = await trpc.lms.course.adminList.query({ limit: 100 }).catch(() => []);
		const firstCourseId = Array.isArray(courses) && courses.length > 0 ? (courses[0] as any).id : null;
		let enrollments: any[] = [];
		if (firstCourseId) {
			enrollments = (await trpc.lms.enrollment.courseEnrollments
				.query({ courseId: firstCourseId, limit: 100 })
				.catch(() => [])) as any[];
		}
		return { courses, enrollments, selectedCourseId: firstCourseId };
	} catch (error) {
		console.error('Error loading enrollments:', error);
		return { courses: [], enrollments: [], selectedCourseId: null };
	}
};
