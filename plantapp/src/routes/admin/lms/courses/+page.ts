import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const courses = await trpc.lms.course.adminList.query({ limit: 100, offset: 0 });
		return { courses };
	} catch (error) {
		console.error('Error loading courses:', error);
		return { courses: [] };
	}
};
