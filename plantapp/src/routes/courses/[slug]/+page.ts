import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { error } from '@sveltejs/kit';

function loadErrorMessage(cause: unknown): string {
	return cause instanceof Error ? cause.message : 'Request failed';
}

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const { slug } = event.params;

	let course;
	try {
		course = await trpc.lms.course.getBySlug.query({ slug });
	} catch (cause) {
		console.error('Error loading course:', loadErrorMessage(cause));
		throw error(404, 'Course not found');
	}
	if (!course) throw error(404, 'Course not found');

	let curriculum: { modules: any[] } = { modules: [] };
	try {
		curriculum = await trpc.lms.curriculum.getCurriculum.query({ courseId: course.id });
	} catch (cause) {
		console.error('Error loading curriculum:', loadErrorMessage(cause));
	}

	return { course, curriculum };
};
