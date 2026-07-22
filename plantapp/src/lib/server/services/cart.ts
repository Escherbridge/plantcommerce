import { eq, and, inArray, isNull, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { FileService } from './file';
import {
	AffiliateAttributionService,
	type ResolvedAffiliateAttribution
} from '../affiliateAttribution';
import { assertPublicCatalogAvailable } from '../catalogTruth/publicCatalog';

export interface CartItem {
	id: number;
	productId: number;
	quantity: number;
	unitPrice: string;
	product: {
		id: number;
		name: string;
		slug: string;
		sku: string;
		price: string;
		comparePrice: string | null;
		stockQuantity: number;
		reservedQuantity: number;
		trackInventory: boolean;
		description: string | null;
		shortDescription: string | null;
		isFeatured: boolean;
		category: {
			id: number;
			name: string;
			slug: string;
			description: string | null;
		};
		images?: Array<{ url: string; altText: string | null; isMain: boolean }>;
	};
}

export interface Cart {
	id: number;
	userId: string | null;
	sessionId: string | null;
	affiliateLinkId: number | null;
	items: CartItem[];
	totalAmount: number;
	totalItems: number;
}

type CartIdentity = { kind: 'user'; userId: string } | { kind: 'guest'; sessionId: string };

function requireCartIdentity(userId?: string, sessionId?: string): CartIdentity {
	if (userId && sessionId) {
		throw new Error('Cart identity must be either a user or a guest session');
	}

	if (userId) {
		return { kind: 'user', userId };
	}

	if (sessionId) {
		return { kind: 'guest', sessionId };
	}

	throw new Error('Either userId or sessionId is required');
}

function cartIdentityCondition(identity: CartIdentity) {
	return identity.kind === 'user'
		? eq(table.cart.userId, identity.userId)
		: and(isNull(table.cart.userId), eq(table.cart.sessionId, identity.sessionId));
}

function cartBelongsToIdentity(
	cart: Pick<Cart, 'userId' | 'sessionId'>,
	identity: CartIdentity
): boolean {
	return identity.kind === 'user'
		? cart.userId === identity.userId
		: cart.userId === null && cart.sessionId === identity.sessionId;
}

function cartAdvisoryLockSubject(identity: CartIdentity): string {
	return identity.kind === 'user'
		? `cart:user:${identity.userId}`
		: `cart:guest:${identity.sessionId}`;
}

export class CartService {
	private static async getOrCreateCartRecord(
		userId?: string,
		sessionId?: string,
		affiliateLinkId?: number
	): Promise<{ id: number; created: boolean }> {
		const identity = requireCartIdentity(userId, sessionId);

		return await db.transaction(async (tx) => {
			// The lock protects current deployments before 0007's partial unique indexes are applied.
			await tx.execute(
				sql`SELECT pg_advisory_xact_lock(hashtext(${cartAdvisoryLockSubject(identity)}))`
			);
			const existingCart = await tx
				.select()
				.from(table.cart)
				.where(cartIdentityCondition(identity))
				.limit(1);

			if (existingCart.length > 0) {
				return { id: existingCart[0].id, created: false };
			}

			const newCart: typeof table.cart.$inferInsert = {
				userId: identity.kind === 'user' ? identity.userId : null,
				sessionId: identity.kind === 'guest' ? identity.sessionId : null,
				affiliateLinkId: affiliateLinkId || null
			};

			const [cart] = await tx.insert(table.cart).values(newCart).returning();
			return { id: cart.id, created: true };
		});
	}

	/**
	 * Get or create cart for user/session
	 */
	static async getOrCreateCart(userId?: string, sessionId?: string): Promise<number> {
		return (await this.getOrCreateCartRecord(userId, sessionId)).id;
	}

	/**
	 * Get full cart with items and product details
	 */
	static async getCart(userId?: string, sessionId?: string): Promise<Cart | null> {
		assertPublicCatalogAvailable();
		const identity = requireCartIdentity(userId, sessionId);

		const cartResult = await db
			.select()
			.from(table.cart)
			.where(cartIdentityCondition(identity))
			.limit(1);

		if (cartResult.length === 0) {
			return null;
		}

		const cart = cartResult[0];

		// Get cart items with product details and image files
		const items = await db
			.select({
				id: table.cartItem.id,
				productId: table.cartItem.productId,
				quantity: table.cartItem.quantity,
				unitPrice: table.cartItem.unitPrice,
				product: table.product,
				category: table.productCategory,
				image: table.productImage,
				file: table.file
			})
			.from(table.cartItem)
			.innerJoin(table.product, eq(table.cartItem.productId, table.product.id))
			.innerJoin(table.productCategory, eq(table.product.categoryId, table.productCategory.id))
			.leftJoin(
				table.productImage,
				and(eq(table.product.id, table.productImage.productId), eq(table.productImage.isMain, true))
			)
			.leftJoin(table.file, eq(table.productImage.fileId, table.file.id))
			.where(eq(table.cartItem.cartId, cart.id));

		const cartItems: CartItem[] = items.map((item) => {
			const imageUrl =
				item.file &&
				item.file.isPublic &&
				item.file.entityType === 'product' &&
				item.file.entityId === String(item.product.id)
					? FileService.generatePublicUrl(item.file.bucketPath, true)
					: null;

			return {
				id: item.id,
				productId: item.productId,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				product: {
					id: item.product.id,
					name: item.product.name,
					slug: item.product.slug,
					sku: item.product.sku,
					price: item.product.price,
					comparePrice: item.product.comparePrice,
					stockQuantity: item.product.stockQuantity,
					reservedQuantity: item.product.reservedQuantity,
					trackInventory: item.product.trackInventory,
					description: item.product.description,
					shortDescription: item.product.shortDescription,
					isFeatured: item.product.isFeatured,
					category: {
						id: item.category.id,
						name: item.category.name,
						slug: item.category.slug,
						description: item.category.description
					},
					images: imageUrl
						? [
								{
									url: imageUrl,
									altText: item.image?.altText || item.product.shortDescription,
									isMain: item.image?.isMain || false
								}
							]
						: []
				}
			};
		});

		const totalAmount = cartItems.reduce(
			(sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
			0
		);
		const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

		return {
			id: cart.id,
			userId: cart.userId,
			sessionId: cart.sessionId,
			affiliateLinkId: cart.affiliateLinkId,
			items: cartItems,
			totalAmount,
			totalItems
		};
	}

	/**
	 * Add item to cart
	 */
	static async addItem(
		productId: number,
		quantity: number,
		userId?: string,
		sessionId?: string,
		affiliateAttribution?: ResolvedAffiliateAttribution
	): Promise<void> {
		assertPublicCatalogAvailable();
		const identity = requireCartIdentity(userId, sessionId);

		// Validate product exists and has stock
		const productResult = await db
			.select()
			.from(table.product)
			.where(and(eq(table.product.id, productId), eq(table.product.isActive, true)))
			.limit(1);

		if (productResult.length === 0) {
			throw new Error('Product not found or inactive');
		}

		const product = productResult[0];

		const availableQuantity = product.stockQuantity - product.reservedQuantity;
		if (product.trackInventory && availableQuantity < quantity) {
			throw new Error('Insufficient stock');
		}

		const cartRecord = await this.getOrCreateCartRecord(
			identity.kind === 'user' ? identity.userId : undefined,
			identity.kind === 'guest' ? identity.sessionId : undefined,
			affiliateAttribution?.affiliateLinkId
		);
		const cartId = cartRecord.id;

		// Check if item already exists in cart
		const existingItem = await db
			.select()
			.from(table.cartItem)
			.where(and(eq(table.cartItem.cartId, cartId), eq(table.cartItem.productId, productId)))
			.limit(1);

		if (existingItem.length > 0) {
			// Update existing item
			const newQuantity = existingItem[0].quantity + quantity;

			if (product.trackInventory && availableQuantity < newQuantity) {
				throw new Error('Insufficient stock');
			}

			await db
				.update(table.cartItem)
				.set({
					quantity: newQuantity,
					updatedAt: new Date()
				})
				.where(eq(table.cartItem.id, existingItem[0].id));
		} else {
			// Add new item
			const newItem: typeof table.cartItem.$inferInsert = {
				cartId,
				productId,
				quantity,
				unitPrice: product.price
			};

			await db.insert(table.cartItem).values(newItem);
		}

		// Update cart timestamp
		await db.update(table.cart).set({ updatedAt: new Date() }).where(eq(table.cart.id, cartId));

		if (affiliateAttribution && !cartRecord.created) {
			await db
				.update(table.cart)
				.set({
					affiliateLinkId: affiliateAttribution.affiliateLinkId,
					updatedAt: new Date()
				})
				.where(and(eq(table.cart.id, cartId), isNull(table.cart.affiliateLinkId)));
		}

		if (affiliateAttribution) {
			try {
				await AffiliateAttributionService.markConsumed(affiliateAttribution.id);
			} catch (error) {
				// Attribution telemetry must never turn a persisted cart change into a client-visible failure.
				console.error('Unable to mark affiliate attribution as consumed:', error);
			}
		}
	}

	/**
	 * Update item quantity in cart
	 */
	static async updateItemQuantity(
		cartItemId: number,
		quantity: number,
		userId?: string,
		sessionId?: string
	): Promise<void> {
		const identity = requireCartIdentity(userId, sessionId);

		// Verify cart item belongs to user/session
		const cartItemResult = await db
			.select({
				cartItem: table.cartItem,
				cart: table.cart,
				product: table.product
			})
			.from(table.cartItem)
			.innerJoin(table.cart, eq(table.cartItem.cartId, table.cart.id))
			.innerJoin(table.product, eq(table.cartItem.productId, table.product.id))
			.where(eq(table.cartItem.id, cartItemId))
			.limit(1);

		if (cartItemResult.length === 0) {
			throw new Error('Cart item not found');
		}

		const { cartItem, cart, product } = cartItemResult[0];

		if (!cartBelongsToIdentity(cart, identity)) {
			throw new Error('Access denied');
		}

		if (quantity <= 0) {
			// Remove item
			await db.delete(table.cartItem).where(eq(table.cartItem.id, cartItemId));
		} else {
			// Check stock
			const availableQuantity = product.stockQuantity - product.reservedQuantity;
			if (product.trackInventory && availableQuantity < quantity) {
				throw new Error('Insufficient stock');
			}

			// Update quantity
			await db
				.update(table.cartItem)
				.set({
					quantity,
					updatedAt: new Date()
				})
				.where(eq(table.cartItem.id, cartItemId));
		}

		// Update cart timestamp
		await db.update(table.cart).set({ updatedAt: new Date() }).where(eq(table.cart.id, cart.id));
	}

	/**
	 * Remove item from cart
	 */
	static async removeItem(cartItemId: number, userId?: string, sessionId?: string): Promise<void> {
		await this.updateItemQuantity(cartItemId, 0, userId, sessionId);
	}

	/**
	 * Clear all items from cart
	 */
	static async clearCart(userId?: string, sessionId?: string): Promise<void> {
		const identity = requireCartIdentity(userId, sessionId);

		const cartResult = await db
			.select()
			.from(table.cart)
			.where(cartIdentityCondition(identity))
			.limit(1);

		if (cartResult.length === 0) {
			return; // No cart to clear
		}

		// Delete all cart items
		await db.delete(table.cartItem).where(eq(table.cartItem.cartId, cartResult[0].id));

		// Update cart timestamp
		await db
			.update(table.cart)
			.set({ updatedAt: new Date() })
			.where(eq(table.cart.id, cartResult[0].id));
	}

	/**
	 * Transfer guest cart to user account
	 */
	static async transferGuestCart(sessionId: string, userId: string): Promise<void> {
		if (!sessionId || !userId) {
			throw new Error('Guest cart session and user ID are required');
		}

		await db.transaction(async (tx) => {
			const lockSubjects = [
				cartAdvisoryLockSubject({ kind: 'guest', sessionId }),
				cartAdvisoryLockSubject({ kind: 'user', userId })
			].sort();
			for (const lockSubject of lockSubjects) {
				await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${lockSubject}))`);
			}
			const [candidateGuestCart] = await tx
				.select({ id: table.cart.id })
				.from(table.cart)
				.where(and(eq(table.cart.sessionId, sessionId), isNull(table.cart.userId)))
				.limit(1);
			if (!candidateGuestCart) {
				return;
			}

			// Match checkout's cart-item then cart-row lock order before changing ownership.
			const guestItems = await tx
				.select({
					id: table.cartItem.id,
					productId: table.cartItem.productId,
					quantity: table.cartItem.quantity
				})
				.from(table.cartItem)
				.where(eq(table.cartItem.cartId, candidateGuestCart.id))
				.for('update');
			const [guestCart] = await tx
				.select()
				.from(table.cart)
				.where(
					and(
						eq(table.cart.id, candidateGuestCart.id),
						eq(table.cart.sessionId, sessionId),
						isNull(table.cart.userId)
					)
				)
				.for('update');
			if (!guestCart) {
				return;
			}

			const activeDrafts = await tx
				.select({ id: table.checkoutDraft.id })
				.from(table.checkoutDraft)
				.where(
					and(
						eq(table.checkoutDraft.sourceCartId, guestCart.id),
						inArray(table.checkoutDraft.status, [
							'pending_session',
							'checkout_created',
							'quarantined',
							'paid'
						])
					)
				)
				.for('update');
			if (activeDrafts.length > 0) {
				throw new Error('Guest cart ownership cannot change while checkout is active');
			}

			const [candidateUserCart] = await tx
				.select()
				.from(table.cart)
				.where(eq(table.cart.userId, userId))
				.limit(1);

			const userItems: Array<{ id: number; productId: number; quantity: number }> =
				candidateUserCart
					? await tx
							.select({
								id: table.cartItem.id,
								productId: table.cartItem.productId,
								quantity: table.cartItem.quantity
							})
							.from(table.cartItem)
							.where(eq(table.cartItem.cartId, candidateUserCart.id))
							.for('update')
					: [];
			const [userCart] = candidateUserCart
				? await tx
						.select()
						.from(table.cart)
						.where(eq(table.cart.id, candidateUserCart.id))
						.for('update')
				: [];

			if (userCart) {
				const userItemByProduct = new Map<
					number,
					{ id: number; productId: number; quantity: number }
				>(userItems.map((item) => [item.productId, item]));
				for (const guestItem of guestItems) {
					const matchingUserItem = userItemByProduct.get(guestItem.productId);
					if (matchingUserItem) {
						const mergedQuantity = matchingUserItem.quantity + guestItem.quantity;
						if (!Number.isSafeInteger(mergedQuantity) || mergedQuantity <= 0) {
							throw new Error('Merged cart quantity is invalid');
						}
						await tx
							.update(table.cartItem)
							.set({ quantity: mergedQuantity, updatedAt: new Date() })
							.where(eq(table.cartItem.id, matchingUserItem.id));
						await tx.delete(table.cartItem).where(eq(table.cartItem.id, guestItem.id));
						matchingUserItem.quantity = mergedQuantity;
					} else {
						await tx
							.update(table.cartItem)
							.set({ cartId: userCart.id, updatedAt: new Date() })
							.where(eq(table.cartItem.id, guestItem.id));
						userItemByProduct.set(guestItem.productId, guestItem);
					}
				}
				await tx
					.update(table.cart)
					.set({ updatedAt: new Date() })
					.where(eq(table.cart.id, userCart.id));
				await tx.delete(table.cart).where(eq(table.cart.id, guestCart.id));
				return;
			}

			await tx
				.update(table.cart)
				.set({ userId, sessionId: null, updatedAt: new Date() })
				.where(eq(table.cart.id, guestCart.id));
		});
	}
}

export default CartService;
