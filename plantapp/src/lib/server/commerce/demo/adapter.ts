import { DEMO_COMMERCE_CONTEXT } from '$lib/commerce/contracts';
import type { CommerceAdapter } from '../adapter';
import { demoCategories, getDemoProductByRoute, searchDemoProducts } from './fixtures';
import {
	addDemoCartItem,
	clearDemoCart,
	getDemoCart,
	getDemoCheckoutReview,
	getDemoOrder,
	submitDemoCheckout,
	updateDemoCartItem
} from './store';

export const demoCommerceAdapter: CommerceAdapter = {
	context: DEMO_COMMERCE_CONTEXT,
	async getCategories() {
		return [...demoCategories];
	},
	async getProducts(input) {
		return searchDemoProducts(input);
	},
	async getProduct(categorySlug, productSlug) {
		return getDemoProductByRoute(categorySlug, productSlug);
	},
	async getCart(event) {
		return getDemoCart(event);
	},
	async addCartItem(event, productId, quantity) {
		return addDemoCartItem(event, productId, quantity);
	},
	async updateCartItem(event, cartItemId, quantity) {
		return updateDemoCartItem(event, cartItemId, quantity);
	},
	async removeCartItem(event, cartItemId) {
		return updateDemoCartItem(event, cartItemId, 0);
	},
	async clearCart(event) {
		return clearDemoCart(event);
	},
	async getCheckoutReview(event) {
		return getDemoCheckoutReview(event);
	},
	async submitCheckout(event, idempotencyKey) {
		return { kind: 'simulated', reference: submitDemoCheckout(event, idempotencyKey).reference };
	},
	async getOrder(event, reference) {
		return getDemoOrder(event, reference);
	}
};
