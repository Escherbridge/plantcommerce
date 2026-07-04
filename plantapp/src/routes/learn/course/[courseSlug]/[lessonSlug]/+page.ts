import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const { courseSlug, lessonSlug } = event.params;

	// Get course (already in layout, but we fetch again since +page.ts can't easily access layout data during load for nested queries)
	let course: any = null;
	try {
		course = await trpc.lms.course.getBySlug.query({ slug: courseSlug });
	} catch (e) {
		throw error(404, 'Course not found');
	}
	if (!course) throw error(404, 'Course not found');

	// Get curriculum to find lesson id by slug
	let curriculum: { modules: any[] } = { modules: [] };
	try {
		curriculum = await trpc.lms.curriculum.getCurriculum.query({ courseId: course.id });
	} catch (e) {
		console.error('Error loading curriculum:', e);
	}

	let currentLesson: any = null;
	let currentModule: any = null;
	let lessonIndex = -1;
	const flatLessons: any[] = [];

	for (const mod of curriculum.modules ?? []) {
		for (const lesson of mod.lessons ?? []) {
			flatLessons.push({ ...lesson, moduleId: mod.id, moduleTitle: mod.title });
			if (lesson.slug === lessonSlug) {
				currentLesson = { ...lesson, moduleId: mod.id };
				currentModule = mod;
				lessonIndex = flatLessons.length - 1;
			}
		}
	}

	if (!currentLesson) {
		throw error(404, 'Lesson not found');
	}

	// Load content blocks
	let blocks: any[] = [];
	try {
		blocks = await trpc.lms.curriculum.getContentBlocks.query({ lessonId: currentLesson.id });
	} catch (e) {
		console.error('Error loading content blocks:', e);
	}

	// Hydrate signed URLs for blocks that have a fileId
	const blocksWithSignedUrls = await Promise.all(
		(blocks ?? []).map(async (block: any) => {
			if (block.fileId) {
				try {
					const result: any = await trpc.lms.media.getStreamingUrl.query({ fileId: block.fileId });
					return { ...block, signedUrl: result?.url };
				} catch (e) {
					console.error('Error loading signed URL for block:', block.id, e);
					return block;
				}
			}
			return block;
		})
	);

	const prevLesson = lessonIndex > 0 ? flatLessons[lessonIndex - 1] : null;
	const nextLesson = lessonIndex >= 0 && lessonIndex < flatLessons.length - 1 ? flatLessons[lessonIndex + 1] : null;

	return {
		course,
		currentLesson,
		currentModule,
		blocks: blocksWithSignedUrls,
		prevLesson,
		nextLesson
	};
};
