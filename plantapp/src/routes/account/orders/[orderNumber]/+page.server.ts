import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import OrderService from '$lib/server/services/order';

export const load: PageServerLoad = async ({ params, locals }) => {
    const { orderNumber } = params;

    try {
        const order = await OrderService.getOrderByNumber(orderNumber);

        if (!order) {
            throw error(404, 'Order not found');
        }

        // Security check:
        // If user is logged in, ensure they own the order.
        // If user is guest (not logged in), we currently allow viewing by order number (MVP).
        // TODO: Implement stricter security for guest orders (e.g., magic link or session check).
        if (locals.user && order.userId && order.userId !== locals.user.id) {
            throw error(403, 'You do not have permission to view this order');
        }

        return {
            order
        };
    } catch (err) {
        if (err instanceof Response) throw err; // Handle sveltekit errors
        console.error('Error loading order:', err);
        throw error(500, 'Failed to load order details');
    }
};
