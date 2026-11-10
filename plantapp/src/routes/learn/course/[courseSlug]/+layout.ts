import type { LayoutLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { error } from '@sveltejs/kit';

function loadErrorMessage(cause: unknown): string {
	return cause instanceof Error ? cause.message : 'Request failed';
}

export const load: LayoutLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const { courseSlug } = event.params;
	const { user } = await event.parent();

	let course: any = null;
	try {
		course = await trpc.lms.course.getBySlug.query({ slug: courseSlug });
	} catch (cause) {
		console.error('Error loading course:', loadErrorMessage(cause));
		throw error(404, 'Course not found');
	}

	if (!course) {
		throw error(404, 'Course not found');
	}

	let curriculum: { modules: any[] } = { modules: [] };
	try {
		curriculum = await trpc.lms.curriculum.getCurriculum.query({ courseId: course.id });
	} catch (cause) {
		console.error('Error loading curriculum:', loadErrorMessage(cause));
	}

	let progress: any = null;
	if (user) {
		try {
			progress = await trpc.lms.progress.getCourseProgress.query({ courseId: course.id });
		} catch (cause) {
			console.error('Error loading progress:', loadErrorMessage(cause));
		}
	}

	return {
		course,
		curriculum,
		progress
	};
};
