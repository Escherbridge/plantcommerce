import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const analytics = await trpc.admin.getAnalytics.query();
		return { analytics };
	} catch (error) {
		return {
			analytics: null,
			error:
				'Analytics data could not be loaded. No zero-value fallback is being shown as a report.'
		};
	}
};
