import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import CartService from '$lib/server/services/cart';

export const actions: Actions = {
    updateQuantity: async ({ request, locals }) => {
        const formData = await request.formData();
        const itemId = Number(formData.get('itemId'));
        const quantity = Number(formData.get('quantity'));

        if (!itemId || isNaN(quantity)) {
            return fail(400, { message: 'Invalid item ID or quantity' });
        }

        try {
            await CartService.updateItemQuantity(
                itemId,
                quantity,
                locals.user?.id,
                locals.session?.id
            );
            return { success: true };
        } catch (error) {
            console.error('Error updating quantity:', error);
            return fail(500, { message: 'Failed to update quantity' });
        }
    },

    removeItem: async ({ request, locals }) => {
        const formData = await request.formData();
        const itemId = Number(formData.get('itemId'));

        if (!itemId) {
            return fail(400, { message: 'Invalid item ID' });
        }

        try {
            await CartService.removeItem(itemId, locals.user?.id, locals.session?.id);
            return { success: true };
        } catch (error) {
            console.error('Error removing item:', error);
            return fail(500, { message: 'Failed to remove item' });
        }
    },

    applyPromo: async ({ request }) => {
        const formData = await request.formData();
        const code = formData.get('code');

        // TODO: Implement promo code logic
        console.log('Apply promo code:', code);

        return { success: false, message: 'Promo codes coming soon! Stay tuned.' };
    }
};
