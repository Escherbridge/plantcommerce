import type { RequestEvent } from '@sveltejs/kit';
import type {
	CheckoutReview,
	CheckoutSubmission,
	CommerceCart,
	CommerceCategory,
	CommerceContext,
	CommerceOrder,
	CommerceProduct,
	ProductSearchInput
} from '$lib/commerce/contracts';
import { resolveCommerceMode } from './runtime';

export interface CommerceAdapter {
	readonly context: CommerceContext;
	getCategories(): Promise<CommerceCategory[]>;
	getProducts(input: ProductSearchInput): Promise<CommerceProduct[]>;
	getProduct(categorySlug: string, productSlug: string): Promise<CommerceProduct | null>;
	getCart(event: RequestEvent): Promise<CommerceCart>;
	addCartItem(event: RequestEvent, productId: string, quantity: number): Promise<CommerceCart>;
	updateCartItem(event: RequestEvent, cartItemId: string, quantity: number): Promise<CommerceCart>;
	removeCartItem(event: RequestEvent, cartItemId: string): Promise<CommerceCart>;
	clearCart(event: RequestEvent): Promise<CommerceCart>;
	getCheckoutReview(event: RequestEvent): Promise<CheckoutReview>;
	submitCheckout(event: RequestEvent, idempotencyKey: string): Promise<CheckoutSubmission>;
	getOrder(event: RequestEvent, reference: string): Promise<CommerceOrder | null>;
}

export async function getCommerceAdapter(
	event: Pick<RequestEvent, 'url' | 'getClientAddress'>
): Promise<CommerceAdapter> {
	const mode = resolveCommerceMode(event);
	if (mode === 'demo') {
		return (await import('./demo/adapter')).demoCommerceAdapter;
	}
	return (await import('./databaseAdapter')).databaseCommerceAdapter;
}
