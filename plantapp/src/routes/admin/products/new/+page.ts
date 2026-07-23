import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

async function loadCategories(
	trpc: ReturnType<typeof createCallerClient>
): Promise<{ id: number; name: string }[]> {
	try {
		const rows = await trpc.products.getAllCategories.query();
		return rows.map((c) => ({ id: c.id, name: c.name }));
	} catch {
		try {
			const rows = await trpc.products.getCategories.query();
			return rows.map((c) => ({ id: c.id, name: c.name }));
		} catch (error) {
			console.error('Error loading categories:', error);
			return [];
		}
	}
}

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const categories = await loadCategories(trpc);
	return { categories };
};
