import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const { slug } = event.params;

	try {
		const course = await trpc.lms.course.getBySlug.query({ slug });
		if (!course) {
			throw error(404, 'Course not found');
		}

		let curriculum: { modules: any[] } = { modules: [] };
		try {
			curriculum = await trpc.lms.curriculum.getCurriculum.query({ courseId: course.id });
		} catch (e) {
			console.error('Error loading curriculum (likely not authenticated):', e);
		}

		return { course, curriculum };
	} catch (e: any) {
		if (e?.status === 404) throw e;
		console.error('Error loading course:', e);
		throw error(404, 'Course not found');
	}
};
