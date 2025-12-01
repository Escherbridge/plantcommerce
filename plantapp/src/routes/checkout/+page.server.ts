import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import CartService from '$lib/server/services/cart';
import OrderService from '$lib/server/services/order';
import { z } from 'zod';

const checkoutSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    address1: z.string().min(1, 'Address is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    sameAsShipping: z.string().optional(),
    billingFirstName: z.string().optional(),
    billingLastName: z.string().optional(),
    billingAddress1: z.string().optional(),
    billingAddress2: z.string().optional(),
    billingCity: z.string().optional(),
    billingState: z.string().optional(),
    billingPostalCode: z.string().optional(),
    billingCountry: z.string().optional()
});

export const load: PageServerLoad = async ({ locals }) => {
    const cart = await CartService.getCart(locals.user?.id, locals.session?.id);

    if (!cart || cart.items.length === 0) {
        throw redirect(302, '/cart');
    }

    return {
        cart,
        user: locals.user
    };
};

export const actions: Actions = {
    default: async ({ request, locals }) => {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);

        // Validate form data
        const result = checkoutSchema.safeParse(data);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            return fail(400, { data, errors });
        }

        const {
            firstName, lastName, email, address1, address2, city, state, postalCode, country,
            sameAsShipping,
            billingFirstName, billingLastName, billingAddress1, billingAddress2, billingCity, billingState, billingPostalCode, billingCountry
        } = result.data;

        const shippingAddress = {
            firstName, lastName, address1, address2, city, state, postalCode, country
        };

        let billingAddress = shippingAddress;

        if (!sameAsShipping) {
            // Validate billing address if not same as shipping
            if (!billingFirstName || !billingLastName || !billingAddress1 || !billingCity || !billingState || !billingPostalCode || !billingCountry) {
                return fail(400, { data, errors: { billing: ['Billing address is incomplete'] } });
            }
            billingAddress = {
                firstName: billingFirstName,
                lastName: billingLastName,
                address1: billingAddress1,
                address2: billingAddress2,
                city: billingCity,
                state: billingState,
                postalCode: billingPostalCode,
                country: billingCountry
            };
        }

        try {
            const order = await OrderService.createOrder({
                userId: locals.user?.id,
                sessionId: locals.session?.id,
                customerEmail: email,
                shippingAddress,
                billingAddress,
                notes: '' // Optional notes
            });

            // Redirect to order confirmation
            throw redirect(303, `/account/orders/${order.orderNumber}`);
        } catch (error) {
            if (error instanceof Response) throw error; // Handle redirect
            console.error('Checkout error:', error);
            return fail(500, { message: 'Failed to process order. Please try again.' });
        }
    }
};
