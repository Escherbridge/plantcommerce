import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const { id } = event.params;
	try {
		const [curriculum, modules] = await Promise.all([
			trpc.lms.curriculum.getCurriculum.query({ courseId: id }).catch(() => null),
			trpc.lms.curriculum.getModules.query({ courseId: id }).catch(() => [])
		]);
		return { courseId: id, curriculum, modules };
	} catch (error) {
		console.error('Error loading course:', error);
		return { courseId: id, curriculum: null, modules: [] };
	}
};
