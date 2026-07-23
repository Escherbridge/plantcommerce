import type { PageServerLoad } from './$types';
import { getCommerceAdapter } from '$lib/server/commerce/adapter';

export const load: PageServerLoad = async (event) => {
	const adapter = await getCommerceAdapter(event);
	try {
		return {
			context: adapter.context,
			featuredProducts: await adapter.getProducts({
				featured: true,
				limit: 6,
				sortBy: 'created',
				sortOrder: 'desc'
			})
		};
	} catch (cause) {
		console.error('Unable to load featured catalogue products:', cause);
		return { context: adapter.context, featuredProducts: [] };
	}
};
