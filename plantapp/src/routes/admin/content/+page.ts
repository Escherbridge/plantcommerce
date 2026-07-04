import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const { url } = event;
	const type = url.searchParams.get('type');

	try {
		const content = await trpc.admin.getAllContent.query({ type: type || undefined });
		return { content };
	} catch (error) {
		return { content: [] };
	}
};
