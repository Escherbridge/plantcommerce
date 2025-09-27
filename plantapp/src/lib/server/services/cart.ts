import { eq, and, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

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
		stockQuantity: number;
		trackInventory: boolean;
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

export class CartService {
	/**
	 * Get or create cart for user/session
	 */
	static async getOrCreateCart(userId?: string, sessionId?: string, affiliateLinkId?: number): Promise<number> {
		if (!userId && !sessionId) {
			throw new Error('Either userId or sessionId is required');
		}

		// Try to find existing cart
		const conditions = [];
		if (userId) {
			conditions.push(eq(table.cart.userId, userId));
		}
		if (sessionId && !userId) {
			conditions.push(eq(table.cart.sessionId, sessionId));
		}

		const existingCart = await db
			.select()
			.from(table.cart)
			.where(and(...conditions))
			.limit(1);

		if (existingCart.length > 0) {
			return existingCart[0].id;
		}

		// Create new cart
		const newCart: typeof table.cart.$inferInsert = {
			userId: userId || null,
			sessionId: sessionId || null,
			affiliateLinkId: affiliateLinkId || null
		};

		const [cart] = await db.insert(table.cart).values(newCart).returning();
		return cart.id;
	}

	/**
	 * Get full cart with items and product details
	 */
	static async getCart(userId?: string, sessionId?: string): Promise<Cart | null> {
		if (!userId && !sessionId) {
			throw new Error('Either userId or sessionId is required');
		}

		const conditions = [];
		if (userId) {
			conditions.push(eq(table.cart.userId, userId));
		}
		if (sessionId && !userId) {
			conditions.push(eq(table.cart.sessionId, sessionId));
		}

		const cartResult = await db
			.select()
			.from(table.cart)
			.where(and(...conditions))
			.limit(1);

		if (cartResult.length === 0) {
			return null;
		}

		const cart = cartResult[0];

		// Get cart items with product details
		const items = await db
			.select({
				id: table.cartItem.id,
				productId: table.cartItem.productId,
				quantity: table.cartItem.quantity,
				unitPrice: table.cartItem.unitPrice,
				product: table.product,
				images: table.productImage
			})
			.from(table.cartItem)
			.innerJoin(table.product, eq(table.cartItem.productId, table.product.id))
			.leftJoin(table.productImage, and(
				eq(table.product.id, table.productImage.productId),
				eq(table.productImage.isMain, true)
			))
			.where(eq(table.cartItem.cartId, cart.id));

		// Group images by product
		const cartItems: CartItem[] = items.map(item => ({
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
				stockQuantity: item.product.stockQuantity,
				trackInventory: item.product.trackInventory,
				images: item.images ? [{
					url: item.images.url,
					altText: item.images.altText,
					isMain: item.images.isMain
				}] : []
			}
		}));

		const totalAmount = cartItems.reduce((sum, item) => 
			sum + (parseFloat(item.unitPrice) * item.quantity), 0
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
		affiliateLinkId?: number
	): Promise<void> {
		// Validate product exists and has stock
		const productResult = await db
			.select()
			.from(table.product)
			.where(and(
				eq(table.product.id, productId),
				eq(table.product.isActive, true)
			))
			.limit(1);

		if (productResult.length === 0) {
			throw new Error('Product not found or inactive');
		}

		const product = productResult[0];

		if (product.trackInventory && product.stockQuantity < quantity) {
			throw new Error('Insufficient stock');
		}

		// Get or create cart
		const cartId = await this.getOrCreateCart(userId, sessionId, affiliateLinkId);

		// Check if item already exists in cart
		const existingItem = await db
			.select()
			.from(table.cartItem)
			.where(and(
				eq(table.cartItem.cartId, cartId),
				eq(table.cartItem.productId, productId)
			))
			.limit(1);

		if (existingItem.length > 0) {
			// Update existing item
			const newQuantity = existingItem[0].quantity + quantity;
			
			if (product.trackInventory && product.stockQuantity < newQuantity) {
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
		await db
			.update(table.cart)
			.set({ updatedAt: new Date() })
			.where(eq(table.cart.id, cartId));
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

		// Verify ownership
		if ((userId && cart.userId !== userId) || (sessionId && cart.sessionId !== sessionId)) {
			throw new Error('Access denied');
		}

		if (quantity <= 0) {
			// Remove item
			await db.delete(table.cartItem).where(eq(table.cartItem.id, cartItemId));
		} else {
			// Check stock
			if (product.trackInventory && product.stockQuantity < quantity) {
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
		await db
			.update(table.cart)
			.set({ updatedAt: new Date() })
			.where(eq(table.cart.id, cart.id));
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
		if (!userId && !sessionId) {
			throw new Error('Either userId or sessionId is required');
		}

		const conditions = [];
		if (userId) {
			conditions.push(eq(table.cart.userId, userId));
		}
		if (sessionId && !userId) {
			conditions.push(eq(table.cart.sessionId, sessionId));
		}

		const cartResult = await db
			.select()
			.from(table.cart)
			.where(and(...conditions))
			.limit(1);

		if (cartResult.length === 0) {
			return; // No cart to clear
		}

		// Delete all cart items
		await db
			.delete(table.cartItem)
			.where(eq(table.cartItem.cartId, cartResult[0].id));

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
		// Find guest cart
		const guestCart = await db
			.select()
			.from(table.cart)
			.where(and(
				eq(table.cart.sessionId, sessionId),
				isNull(table.cart.userId)
			))
			.limit(1);

		if (guestCart.length === 0) {
			return; // No guest cart to transfer
		}

		// Check if user already has a cart
		const userCart = await db
			.select()
			.from(table.cart)
			.where(eq(table.cart.userId, userId))
			.limit(1);

		if (userCart.length > 0) {
			// Merge carts - move all items from guest cart to user cart
			await db
				.update(table.cartItem)
				.set({ cartId: userCart[0].id })
				.where(eq(table.cartItem.cartId, guestCart[0].id));

			// Delete guest cart
			await db.delete(table.cart).where(eq(table.cart.id, guestCart[0].id));
		} else {
			// Simply assign guest cart to user
			await db
				.update(table.cart)
				.set({ 
					userId,
					sessionId: null,
					updatedAt: new Date()
				})
				.where(eq(table.cart.id, guestCart[0].id));
		}
	}
}

export default CartService;
