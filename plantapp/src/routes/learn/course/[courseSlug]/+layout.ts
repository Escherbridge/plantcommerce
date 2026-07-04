import type { LayoutLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const { courseSlug } = event.params;

	let course: any = null;
	try {
		course = await trpc.lms.course.getBySlug.query({ slug: courseSlug });
	} catch (e) {
		console.error('Error loading course:', e);
		throw error(404, 'Course not found');
	}

	if (!course) {
		throw error(404, 'Course not found');
	}

	let curriculum: { modules: any[] } = { modules: [] };
	try {
		curriculum = await trpc.lms.curriculum.getCurriculum.query({ courseId: course.id });
	} catch (e) {
		console.error('Error loading curriculum:', e);
	}

	let progress: any = null;
	try {
		progress = await trpc.lms.progress.getCourseProgress.query({ courseId: course.id });
	} catch (e) {
		console.error('Error loading progress:', e);
	}

	return {
		course,
		curriculum,
		progress
	};
};
