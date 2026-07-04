import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const result = await trpc.lms.course.list.query({ limit: 24 });
		return {
			courses: result?.courses ?? [],
			total: result?.total ?? 0
		};
	} catch (e) {
		console.error('Error loading courses:', e);
		return { courses: [], total: 0 };
	}
};
