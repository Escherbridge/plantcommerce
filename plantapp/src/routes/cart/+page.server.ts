import { fail, type RequestEvent } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCommerceAdapter } from '$lib/server/commerce/adapter';

export const load: PageServerLoad = async (event) => {
	const adapter = await getCommerceAdapter(event);
	return { context: adapter.context, cart: await adapter.getCart(event) };
};

async function cartMutation(event: RequestEvent, operation: 'update' | 'remove' | 'clear') {
	try {
		const adapter = await getCommerceAdapter(event);
		if (operation === 'clear') return { cart: await adapter.clearCart(event) };
		const data = await event.request.formData();
		const cartItemId = data.get('cartItemId');
		if (typeof cartItemId !== 'string') return fail(400, { message: 'Invalid cart item' });
		if (operation === 'remove') {
			return { cart: await adapter.removeCartItem(event, cartItemId) };
		}
		const quantity = Number(data.get('quantity'));
		if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 99) {
			return fail(400, { message: 'Quantity must be between 0 and 99' });
		}
		return { cart: await adapter.updateCartItem(event, cartItemId, quantity) };
	} catch (cause) {
		return fail(400, { message: cause instanceof Error ? cause.message : 'Cart update failed' });
	}
}

export const actions: Actions = {
	update: (event) => cartMutation(event, 'update'),
	remove: (event) => cartMutation(event, 'remove'),
	clear: (event) => cartMutation(event, 'clear')
};
