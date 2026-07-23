import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
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
		} catch (err) {
			console.error('Error loading categories:', err);
			return [];
		}
	}
}

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const id = Number(event.params.id);
	if (!Number.isFinite(id)) throw error(404, 'Product not found');

	const [product, categories] = await Promise.all([
		trpc.products.getProductById.query({ id }).catch(() => null),
		loadCategories(trpc)
	]);

	if (!product) throw error(404, 'Product not found');

	return { product, categories };
};
