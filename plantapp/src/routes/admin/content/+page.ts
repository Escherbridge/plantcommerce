import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const { url } = event;
	const type = url.searchParams.get('type');

	try {
		const content = await trpc(event).admin.getAllContent.query({ type: type || undefined });
		return { content };
	} catch (error) {
		return { content: [] };
	}
};
