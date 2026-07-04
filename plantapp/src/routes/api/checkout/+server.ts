import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CartService } from '$lib/server/services/cart';
import { StripeCheckoutService } from '$lib/server/services/stripeCheckout';
import { FileService } from '$lib/server/services/file';

export const POST: RequestHandler = async ({ request, locals, url }) => {
	try {
		const body = await request.json();
		const { sessionId: guestSessionId } = body;

		// Determine user identity
		const userId = locals.user?.id || null;
		const cartSessionId = guestSessionId || locals.guestSessionId || null;

		if (!userId && !cartSessionId) {
			throw error(400, 'No cart session found');
		}

		// Get the cart
		const cart = await CartService.getCart(userId || undefined, cartSessionId || undefined);

		if (!cart || cart.items.length === 0) {
			throw error(400, 'Cart is empty');
		}

		// Build line items from cart
		const lineItems = cart.items.map((item: any) => {
			// Try to get image URL
			let imageUrl: string | undefined;
			if (item.images && item.images.length > 0) {
				const mainImage = item.images.find((img: any) => img.isMain) || item.images[0];
				if (mainImage?.url) {
					// Convert relative URLs to absolute
					imageUrl = mainImage.url.startsWith('http')
						? mainImage.url
						: `${url.origin}${mainImage.url}`;
				}
			}

			return {
				productId: item.productId,
				name: item.product?.name || `Product #${item.productId}`,
				description: item.product?.shortDescription || undefined,
				unitPrice: parseFloat(item.unitPrice),
				quantity: item.quantity,
				imageUrl
			};
		});

		// Create Stripe Checkout Session
		const baseUrl = url.origin;
		const session = await StripeCheckoutService.createCheckoutSession({
			lineItems,
			cartId: cart.id,
			userId,
			sessionId: cartSessionId,
			customerEmail: locals.user?.email || undefined,
			successUrl: `${baseUrl}/checkout/success`,
			cancelUrl: `${baseUrl}/cart`
		});

		if (!session.url) {
			throw error(500, 'Failed to create checkout session');
		}

		return json({ url: session.url, sessionId: session.id });
	} catch (err: any) {
		console.error('[Checkout API] Error:', err);

		// Re-throw SvelteKit errors
		if (err?.status) {
			throw err;
		}

		throw error(500, err?.message || 'Failed to create checkout session');
	}
};
