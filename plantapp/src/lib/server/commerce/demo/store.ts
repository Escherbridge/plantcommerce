import type { RequestEvent } from '@sveltejs/kit';
import {
	assertMinorUnits,
	money,
	type CheckoutReview,
	type CommerceCart,
	type CommerceCartItem,
	type CommerceOrder
} from '$lib/commerce/contracts';
import { getDemoProductById } from './fixtures';

const DEMO_SESSION_COOKIE = 'aevani_demo_commerce';
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_SESSIONS = 100;
const MAX_ORDERS_PER_SESSION = 20;
const TAX_BASIS_POINTS = 800n;
const SHIPPING_MINOR = 500;

type DemoSession = {
	token: string;
	updatedAt: number;
	cart: Map<string, number>;
	orders: Map<string, CommerceOrder>;
	idempotency: Map<string, string>;
	issuedCheckoutKeys: Set<string>;
};

const sessions = new Map<string, DemoSession>();

function pruneSessions(now = Date.now()): void {
	for (const [token, session] of sessions) {
		if (now - session.updatedAt > SESSION_TTL_MS) sessions.delete(token);
	}
	while (sessions.size >= MAX_SESSIONS) {
		const oldest = [...sessions.values()].sort(
			(left, right) => left.updatedAt - right.updatedAt
		)[0];
		if (!oldest) break;
		sessions.delete(oldest.token);
	}
}

function newToken(): string {
	return crypto.randomUUID().replaceAll('-', '');
}

function getSession(event: Pick<RequestEvent, 'cookies' | 'url'>): DemoSession {
	pruneSessions();
	const suppliedToken = event.cookies.get(DEMO_SESSION_COOKIE);
	let session = suppliedToken ? sessions.get(suppliedToken) : undefined;
	if (!session) {
		const token = newToken();
		session = {
			token,
			updatedAt: Date.now(),
			cart: new Map(),
			orders: new Map(),
			idempotency: new Map(),
			issuedCheckoutKeys: new Set()
		};
		sessions.set(token, session);
		event.cookies.set(DEMO_SESSION_COOKIE, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: event.url.protocol === 'https:',
			maxAge: SESSION_TTL_MS / 1000
		});
	}
	session.updatedAt = Date.now();
	return session;
}

function cartFromSession(session: DemoSession): CommerceCart {
	const items: CommerceCartItem[] = [];
	for (const [productId, quantity] of session.cart) {
		const product = getDemoProductById(productId);
		if (!product) continue;
		items.push({
			id: `demo-cart-item:${product.slug}`,
			productId,
			quantity,
			unitPrice: product.price,
			product
		});
	}
	const subtotalMinor = items.reduce(
		(total, item) =>
			assertMinorUnits(total + item.unitPrice.amountMinor * item.quantity, 'Cart subtotal'),
		0
	);
	return {
		id: `demo-cart:${session.token.slice(0, 12)}`,
		items,
		totalItems: items.reduce((total, item) => total + item.quantity, 0),
		subtotal: money(subtotalMinor)
	};
}

export function getDemoCart(event: Pick<RequestEvent, 'cookies' | 'url'>): CommerceCart {
	return cartFromSession(getSession(event));
}

export function addDemoCartItem(
	event: Pick<RequestEvent, 'cookies' | 'url'>,
	productId: string,
	quantity: number
): CommerceCart {
	if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
		throw new Error('Test quantity must be between 1 and 99');
	}
	const product = getDemoProductById(productId);
	if (!product) throw new Error('Mock/test product not found');
	const session = getSession(event);
	const nextQuantity = (session.cart.get(productId) ?? 0) + quantity;
	if (nextQuantity > Math.min(99, product.availableQuantity)) {
		throw new Error(`Only ${product.availableQuantity} simulated units are available`);
	}
	session.cart.set(productId, nextQuantity);
	return cartFromSession(session);
}

function productIdFromCartItemId(cartItemId: string): string {
	if (!cartItemId.startsWith('demo-cart-item:')) throw new Error('Mock/test cart item not found');
	return `demo-product:${cartItemId.slice('demo-cart-item:'.length)}`;
}

export function updateDemoCartItem(
	event: Pick<RequestEvent, 'cookies' | 'url'>,
	cartItemId: string,
	quantity: number
): CommerceCart {
	if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 99) {
		throw new Error('Test quantity must be between 0 and 99');
	}
	const session = getSession(event);
	const productId = productIdFromCartItemId(cartItemId);
	if (!session.cart.has(productId)) throw new Error('Mock/test cart item not found');
	const product = getDemoProductById(productId);
	if (!product) throw new Error('Mock/test product not found');
	if (quantity > Math.min(99, product.availableQuantity)) {
		throw new Error(`Only ${product.availableQuantity} simulated units are available`);
	}
	if (quantity === 0) session.cart.delete(productId);
	else session.cart.set(productId, quantity);
	return cartFromSession(session);
}

export function clearDemoCart(event: Pick<RequestEvent, 'cookies' | 'url'>): CommerceCart {
	const session = getSession(event);
	session.cart.clear();
	return cartFromSession(session);
}

function checkoutAmounts(cart: CommerceCart) {
	const subtotalMinor = BigInt(cart.subtotal.amountMinor);
	const taxMinor = Number((subtotalMinor * TAX_BASIS_POINTS + 5000n) / 10000n);
	const totalMinor = assertMinorUnits(
		cart.subtotal.amountMinor + taxMinor + SHIPPING_MINOR,
		'Test checkout total'
	);
	return {
		subtotal: cart.subtotal,
		tax: money(taxMinor),
		shipping: money(SHIPPING_MINOR),
		discount: money(0),
		total: money(totalMinor)
	};
}

export function getDemoCheckoutReview(
	event: Pick<RequestEvent, 'cookies' | 'url'>
): CheckoutReview {
	const session = getSession(event);
	const cart = cartFromSession(session);
	if (!cart.items.length) throw new Error('Add a mock/test item before reviewing checkout');
	const idempotencyKey = `demo-checkout-${newToken()}`;
	while (session.issuedCheckoutKeys.size >= MAX_ORDERS_PER_SESSION) {
		const oldestKey = session.issuedCheckoutKeys.values().next().value as string | undefined;
		if (!oldestKey) break;
		session.issuedCheckoutKeys.delete(oldestKey);
	}
	session.issuedCheckoutKeys.add(idempotencyKey);
	return {
		idempotencyKey,
		canSubmit: true,
		unavailableReason: null,
		cart,
		...checkoutAmounts(cart),
		contactLabel: 'Test Customer · mock.customer@example.invalid',
		shippingLabel: '123 Test Garden Lane · Example, CO 00000'
	};
}

export function submitDemoCheckout(
	event: Pick<RequestEvent, 'cookies' | 'url'>,
	idempotencyKey: string
): CommerceOrder {
	if (!/^demo-checkout-[a-f0-9]{32}$/.test(idempotencyKey)) {
		throw new Error('Invalid mock/test checkout submission');
	}
	const session = getSession(event);
	const priorReference = session.idempotency.get(idempotencyKey);
	if (priorReference) {
		const priorOrder = session.orders.get(priorReference);
		if (!priorOrder) throw new Error('Mock/test checkout state expired');
		return priorOrder;
	}
	if (!session.issuedCheckoutKeys.has(idempotencyKey)) {
		throw new Error('Mock/test checkout review is missing or expired');
	}
	const cart = cartFromSession(session);
	if (!cart.items.length) throw new Error('Add a mock/test item before checkout');
	const reference = `TEST-${newToken().slice(0, 16).toUpperCase()}`;
	const order: CommerceOrder = {
		reference,
		status: 'simulated',
		items: cart.items.map((item) => ({ ...item, product: { ...item.product } })),
		...checkoutAmounts(cart),
		contactLabel: 'Test Customer · mock.customer@example.invalid',
		createdAt: new Date().toISOString(),
		dataClass: 'mock_test'
	};
	while (session.orders.size >= MAX_ORDERS_PER_SESSION) {
		const oldestReference = session.orders.keys().next().value as string | undefined;
		if (!oldestReference) break;
		session.orders.delete(oldestReference);
		for (const [key, storedReference] of session.idempotency) {
			if (storedReference === oldestReference) {
				session.idempotency.delete(key);
				session.issuedCheckoutKeys.delete(key);
			}
		}
	}
	session.orders.set(reference, order);
	session.idempotency.set(idempotencyKey, reference);
	session.cart.clear();
	return order;
}

export function getDemoOrder(
	event: Pick<RequestEvent, 'cookies' | 'url'>,
	reference: string
): CommerceOrder | null {
	return getSession(event).orders.get(reference) ?? null;
}

export function resetDemoCommerceStoreForTests(): void {
	sessions.clear();
}
