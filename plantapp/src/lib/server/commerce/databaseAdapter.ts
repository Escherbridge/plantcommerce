import type { RequestEvent } from '@sveltejs/kit';
import type { Cart as DatabaseCart } from '$lib/server/services/cart';
import type { ProductWithImages } from '$lib/server/services/product';
import { getPublicProductImages } from '$lib/utils/productMedia';
import {
	DATABASE_COMMERCE_CONTEXT,
	decimalToMinorUnits,
	money,
	type CommerceCart,
	type CommerceCartItem,
	type CommerceCategory,
	type CommerceFacet,
	type CommerceGuide,
	type CommerceProduct
} from '$lib/commerce/contracts';
import type { CommerceAdapter } from './adapter';

type DatabaseIdentity = { userId?: string; sessionId?: string };

type DatabaseCategorySource = {
	id: number;
	slug: string;
	name: string;
	description?: string | null;
	parentSlug?: string | null;
};

type DatabaseProductSource = Pick<ProductWithImages, 'id' | 'slug' | 'name' | 'sku' | 'price'> &
	// mapProduct null-guards these, so they may be absent on lighter sources (e.g. cart items).
	Partial<
		Pick<
			ProductWithImages,
			| 'shortDescription'
			| 'description'
			| 'comparePrice'
			| 'stockQuantity'
			| 'reservedQuantity'
			| 'trackInventory'
			| 'isFeatured'
		>
	> & {
	category?: DatabaseCategorySource;
	images?: Array<{ url?: string; altText: string | null; isMock?: boolean }>;
	catalogDataClass?: 'verified' | 'research' | 'mock_test';
	catalogDisclosure?: string | null;
	catalogCategories?: Array<{ id: number; name: string; slug: string }>;
	catalogTags?: Array<{ slug: string; name: string }>;
	manufacturers?: Array<{
		name: string;
		status: 'unverified' | 'verified' | 'retired';
		websiteUrl: string | null;
	}>;
	contentAreas?: Array<{ slug: string; name: string }>;
	facets?: CommerceFacet[];
	guides?: CommerceGuide[];
};

type DatabaseProductRow =
	| DatabaseProductSource
	| { product: DatabaseProductSource; category: DatabaseCategorySource };

function numericId(value: string, prefix: string): number {
	if (!value.startsWith(prefix))
		throw new Error('Commerce identifier does not match database mode');
	const id = Number(value.slice(prefix.length));
	if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid commerce identifier');
	return id;
}

function assertQuantity(quantity: number, minimum: 0 | 1): void {
	if (!Number.isSafeInteger(quantity) || quantity < minimum || quantity > 99) {
		throw new Error(`Quantity must be between ${minimum} and 99`);
	}
}

async function databaseIdentity(event: RequestEvent): Promise<DatabaseIdentity> {
	if (event.locals.user) return { userId: event.locals.user.id };
	const { getOrCreateGuestCartSessionId } = await import('$lib/server/guestCart');
	return { sessionId: getOrCreateGuestCartSessionId(event.cookies) };
}

function mapCategory(category: DatabaseCategorySource): CommerceCategory {
	return {
		id: `database-category:${category.id}`,
		slug: category.slug,
		name: category.name,
		description: category.description ?? null,
		parentSlug: category.parentSlug ?? null
	};
}

function mapProduct(row: DatabaseProductRow): CommerceProduct {
	const product = 'product' in row ? row.product : row;
	const category = 'product' in row ? row.category : product.category;
	if (!category) throw new Error('Database product is missing its category');
	const imageFallback = product.shortDescription || product.name;
	const images = getPublicProductImages(product.images, imageFallback).map((image) => ({
		url: image.url,
		altText: image.altText || imageFallback,
		isMock: image.isMock
	}));
	const priceMinor = decimalToMinorUnits(String(product.price));
	const availableQuantity =
		product.trackInventory === false
			? 99
			: Math.max(0, Number(product.stockQuantity ?? 0) - Number(product.reservedQuantity ?? 0));
	return {
		id: `database-product:${product.id}`,
		slug: product.slug,
		name: product.name,
		description: product.description ?? product.shortDescription ?? '',
		shortDescription: product.shortDescription ?? product.description ?? '',
		sku: product.sku,
		category: mapCategory(category),
		price: money(priceMinor),
		comparePrice: product.comparePrice
			? money(decimalToMinorUnits(String(product.comparePrice)))
			: null,
		availableQuantity,
		inStock: availableQuantity > 0,
		featured: Boolean(product.isFeatured),
		images,
		dataClass: 'database',
		catalogDataClass: product.catalogDataClass,
		catalogDisclosure: product.catalogDisclosure,
		categories: product.catalogCategories?.map((candidate) => mapCategory(candidate)),
		tags: product.catalogTags,
		manufacturers: product.manufacturers,
		contentAreas: product.contentAreas,
		facets: product.facets,
		guides: product.guides
	};
}

async function emptyDatabaseCart(): Promise<CommerceCart> {
	return {
		id: 'database-cart:none',
		items: [],
		totalItems: 0,
		subtotal: money(0)
	};
}

async function mapDatabaseCart(cart: DatabaseCart | null): Promise<CommerceCart> {
	if (!cart) return emptyDatabaseCart();
	const items: CommerceCartItem[] = [];
	for (const item of cart.items ?? []) {
		const product = mapProduct(item.product);
		items.push({
			id: `database-cart-item:${item.id}`,
			productId: product.id,
			quantity: item.quantity,
			unitPrice: money(decimalToMinorUnits(String(item.unitPrice))),
			product
		});
	}
	const subtotalMinor = items.reduce(
		(total, item) => total + item.unitPrice.amountMinor * item.quantity,
		0
	);
	return {
		id: `database-cart:${cart.id}`,
		items,
		totalItems: items.reduce((total, item) => total + item.quantity, 0),
		subtotal: money(subtotalMinor)
	};
}

async function readDatabaseCart(event: RequestEvent): Promise<CommerceCart> {
	const { CartService } = await import('$lib/server/services/cart');
	const identity = await databaseIdentity(event);
	return mapDatabaseCart(await CartService.getCart(identity.userId, identity.sessionId));
}

export const databaseCommerceAdapter: CommerceAdapter = {
	context: DATABASE_COMMERCE_CONTEXT,
	async getCategories() {
		const { ProductService } = await import('$lib/server/services/product');
		const categories = await ProductService.getCategories();
		const byId = new Map(categories.map((category) => [category.id, category]));
		return categories.map((category) =>
			mapCategory({
				...category,
				parentSlug: category.parentId ? byId.get(category.parentId)?.slug : null
			})
		);
	},
	async getTags() {
		const { ProductService } = await import('$lib/server/services/product');
		return ProductService.getTags();
	},
	async getProducts(input) {
		const { ProductService } = await import('$lib/server/services/product');
		let categoryId: number | undefined;
		if (input.categorySlug) {
			const categories = await ProductService.getCategories();
			categoryId = categories.find((category) => category.slug === input.categorySlug)?.id;
			if (!categoryId) return [];
		}
		const categoryIds = categoryId ? [categoryId] : input.categoryIds;
		const rows = await ProductService.getProducts({
			categoryIds,
			categorySlug: input.categorySlug,
			search: input.search,
			tag: input.tag,
			featured: input.featured,
			limit: input.limit,
			offset: input.offset,
			sortBy: input.sortBy,
			sortOrder: input.sortOrder
		});
		return rows.map(mapProduct);
	},
	async getProduct(categorySlug, productSlug) {
		const { ProductService } = await import('$lib/server/services/product');
		const product = await ProductService.getProductBySlug(productSlug);
		if (
			!product ||
			![
				product.category.slug,
				...(product.catalogCategories ?? []).map((category) => category.slug)
			].includes(categorySlug)
		)
			return null;
		return mapProduct(product);
	},
	async getCart(event) {
		return readDatabaseCart(event);
	},
	async addCartItem(event, productId, quantity) {
		assertQuantity(quantity, 1);
		const { CartService } = await import('$lib/server/services/cart');
		const identity = await databaseIdentity(event);
		const {
			AffiliateAttributionService,
			clearAffiliateAttributionCookie,
			clearLegacyAffiliateCookie
		} = await import('$lib/server/affiliateAttribution');
		clearLegacyAffiliateCookie(event.cookies);
		let attribution = null;
		try {
			attribution = await AffiliateAttributionService.resolveForCart(
				event.cookies,
				event.locals.user?.id
			);
		} catch (error) {
			console.error('Unable to resolve affiliate attribution for cart:', error);
		}
		await CartService.addItem(
			numericId(productId, 'database-product:'),
			quantity,
			identity.userId,
			identity.sessionId,
			attribution ?? undefined
		);
		if (attribution) clearAffiliateAttributionCookie(event.cookies);
		return readDatabaseCart(event);
	},
	async updateCartItem(event, cartItemId, quantity) {
		assertQuantity(quantity, 0);
		const { CartService } = await import('$lib/server/services/cart');
		const identity = await databaseIdentity(event);
		await CartService.updateItemQuantity(
			numericId(cartItemId, 'database-cart-item:'),
			quantity,
			identity.userId,
			identity.sessionId
		);
		return readDatabaseCart(event);
	},
	async removeCartItem(event, cartItemId) {
		return this.updateCartItem(event, cartItemId, 0);
	},
	async clearCart(event) {
		const { CartService } = await import('$lib/server/services/cart');
		const identity = await databaseIdentity(event);
		await CartService.clearCart(identity.userId, identity.sessionId);
		return readDatabaseCart(event);
	},
	async getCheckoutReview(event) {
		const cart = await readDatabaseCart(event);
		if (!cart.items.length) throw new Error('Add an item before reviewing checkout');
		const { calculateCheckoutTotals } = await import('$lib/server/services/checkoutDraft');
		const { env } = await import('$env/dynamic/private');
		const canSubmit = env.SECURE_CHECKOUT_ENABLED === 'true';
		const totals = calculateCheckoutTotals(cart.subtotal.amountMinor);
		return {
			idempotencyKey: 'database-checkout',
			canSubmit,
			unavailableReason: canSubmit ? null : 'Secure checkout is temporarily unavailable.',
			cart,
			subtotal: money(totals.subtotalMinor),
			tax: money(totals.taxMinor),
			shipping: money(totals.shippingMinor),
			discount: money(totals.discountMinor),
			total: money(totals.totalMinor),
			contactLabel: canSubmit
				? 'Provided on the secure payment step'
				: 'Unavailable while secure checkout is disabled',
			shippingLabel: canSubmit
				? 'Provided on the secure payment step'
				: 'Unavailable while secure checkout is disabled'
		};
	},
	async submitCheckout(event) {
		const { env } = await import('$env/dynamic/private');
		if (env.SECURE_CHECKOUT_ENABLED !== 'true') {
			throw new Error('Secure checkout is temporarily unavailable');
		}
		const identity = await databaseIdentity(event);
		const buyer = identity.userId
			? { kind: 'user' as const, userId: identity.userId }
			: { kind: 'guest' as const, guestCartSessionId: identity.sessionId! };
		const { CheckoutPaymentService } = await import('$lib/server/services/checkoutPayment');
		const session = await CheckoutPaymentService.createOrReuseSession(buyer);
		if (buyer.kind === 'guest') {
			const { GuestOrderAccessService } = await import('$lib/server/guestOrderAccess');
			const grant = await GuestOrderAccessService.issueForDraft(session.draftId);
			GuestOrderAccessService.setCookie(event.cookies, grant);
		}
		return { kind: 'redirect', url: session.checkoutUrl };
	},
	async getOrder() {
		// Database order access remains in the hardened success loader and OrderService.
		return null;
	}
};
