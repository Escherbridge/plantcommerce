import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCommerceAdapter } from '$lib/server/commerce/adapter';

export const load: PageServerLoad = async (event) => {
	const adapter = await getCommerceAdapter(event);
	const product = await adapter.getProduct(event.params.category, event.params.slug);
	if (!product) throw error(404, 'Product not found in this category');
	const relatedProducts = (
		await adapter.getProducts({ categorySlug: product.category.slug, limit: 5, sortBy: 'created' })
	)
		.filter((candidate) => candidate.id !== product.id)
		.slice(0, 4);
	return { context: adapter.context, product, relatedProducts };
};

export const actions: Actions = {
	add: async (event) => {
		const data = await event.request.formData();
		const productId = data.get('productId');
		const quantity = Number(data.get('quantity') ?? 1);
		if (
			typeof productId !== 'string' ||
			!Number.isSafeInteger(quantity) ||
			quantity < 1 ||
			quantity > 99
		) {
			return fail(400, { message: 'Quantity must be between 1 and 99.' });
		}
		const adapter = await getCommerceAdapter(event);
		const product = await adapter.getProduct(event.params.category, event.params.slug);
		if (!product || product.id !== productId) {
			return fail(400, { message: 'This product could not be added.' });
		}
		if (!product.inStock) {
			return fail(400, { message: 'This product is out of stock.' });
		}
		if (quantity > Math.min(99, product.availableQuantity)) {
			return fail(400, {
				message: `Choose a quantity between 1 and ${Math.min(99, product.availableQuantity)}.`
			});
		}
		try {
			await adapter.addCartItem(event, productId, quantity);
		} catch (cause) {
			return fail(400, {
				message: cause instanceof Error ? cause.message : 'This product could not be added.'
			});
		}
		throw redirect(303, '/cart');
	}
};
