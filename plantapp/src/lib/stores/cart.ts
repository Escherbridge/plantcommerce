import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { trpc } from '$lib/trpc/client';
import { toasts } from './toast';

export interface CartState {
	items: CartItem[];
	totalItems: number;
	totalAmount: number;
	loading: boolean;
}

export interface CartItem {
	id: number;
	productId: number;
	quantity: number;
	unitPrice: string;
	product?: {
		id: number;
		name: string;
		slug: string;
		shortDescription: string | null;
		images: Array<{ url: string; altText: string | null }>;
	};
}

const GUEST_SESSION_KEY = 'aevani_guest_session';

function getGuestSessionId(): string {
	if (!browser) return '';
	let sessionId = localStorage.getItem(GUEST_SESSION_KEY);
	if (!sessionId) {
		sessionId = crypto.randomUUID();
		localStorage.setItem(GUEST_SESSION_KEY, sessionId);
	}
	// Also set as cookie so server-side actions (checkout) can read it
	document.cookie = `${GUEST_SESSION_KEY}=${sessionId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
	return sessionId;
}

function createCartStore() {
	const { subscribe, set, update } = writable<CartState>({
		items: [],
		totalItems: 0,
		totalAmount: 0,
		loading: false
	});

	async function refresh() {
		if (!browser) return;
		try {
			const sessionId = getGuestSessionId();
			const cart = await trpc.cart.getCart.query({ sessionId });
			if (cart && cart.items) {
				const items = cart.items as CartItem[];
				set({
					items,
					totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
					totalAmount: items.reduce(
						(sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
						0
					),
					loading: false
				});
			} else {
				set({ items: [], totalItems: 0, totalAmount: 0, loading: false });
			}
		} catch (error) {
			console.error('Error refreshing cart:', error);
			set({ items: [], totalItems: 0, totalAmount: 0, loading: false });
		}
	}

	async function addItem(productId: number, quantity: number, productName?: string) {
		if (!browser) return;
		update((s) => ({ ...s, loading: true }));
		try {
			const sessionId = getGuestSessionId();
			await trpc.cart.addItem.mutate({ productId, quantity, sessionId });
			await refresh();
			toasts.addToast({
				message: `Added ${quantity} × ${productName || 'item'} to cart`,
				variant: 'success',
				duration: 3000
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to add item to cart';
			toasts.addToast({ message, variant: 'error', duration: 4000 });
			update((s) => ({ ...s, loading: false }));
		}
	}

	async function updateItemQuantity(cartItemId: number, quantity: number) {
		if (!browser) return;
		update((s) => ({ ...s, loading: true }));
		try {
			const sessionId = getGuestSessionId();
			await trpc.cart.updateItemQuantity.mutate({ cartItemId, quantity, sessionId });
			await refresh();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Failed to update cart';
			toasts.addToast({ message, variant: 'error', duration: 4000 });
			update((s) => ({ ...s, loading: false }));
		}
	}

	async function removeItem(cartItemId: number) {
		if (!browser) return;
		update((s) => ({ ...s, loading: true }));
		try {
			const sessionId = getGuestSessionId();
			await trpc.cart.removeItem.mutate({ cartItemId, sessionId });
			await refresh();
			toasts.addToast({
				message: 'Item removed from cart',
				variant: 'info',
				duration: 2000
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Failed to remove item';
			toasts.addToast({ message, variant: 'error', duration: 4000 });
			update((s) => ({ ...s, loading: false }));
		}
	}

	async function clearCart() {
		if (!browser) return;
		update((s) => ({ ...s, loading: true }));
		try {
			const sessionId = getGuestSessionId();
			await trpc.cart.clearCart.mutate({ sessionId });
			set({ items: [], totalItems: 0, totalAmount: 0, loading: false });
		} catch (error) {
			update((s) => ({ ...s, loading: false }));
		}
	}

	return {
		subscribe,
		refresh,
		addItem,
		updateItemQuantity,
		removeItem,
		clearCart,
		getGuestSessionId
	};
}

export const cart = createCartStore();
