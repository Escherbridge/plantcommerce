import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const queue = await trpc.lms.quiz.gradingQueue.query({});
		return { queue };
	} catch (error) {
		console.error('Error loading grading queue:', error);
		return { queue: [] };
	}
};
