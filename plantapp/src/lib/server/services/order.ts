import { eq, desc, and, or, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { CartService } from './cart';
import AffiliateService from './affiliate';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface CreateOrderParams {
	userId?: string;
	sessionId?: string;
	customerEmail: string;
	customerPhone?: string;
	shippingAddress: {
		firstName: string;
		lastName: string;
		address1: string;
		address2?: string;
		city: string;
		state: string;
		postalCode: string;
		country: string;
	};
	billingAddress?: {
		firstName: string;
		lastName: string;
		address1: string;
		address2?: string;
		city: string;
		state: string;
		postalCode: string;
		country: string;
	};
	notes?: string;
}

export interface OrderSummary {
	id: number;
	orderNumber: string;
	status: OrderStatus;
	totalAmount: string;
	createdAt: Date;
	itemCount: number;
}

export interface OrderDetails {
	id: number;
	orderNumber: string;
	userId: string | null;
	status: OrderStatus;
	totalAmount: string;
	subtotalAmount: string;
	taxAmount: string;
	shippingAmount: string;
	discountAmount: string;
	affiliateCommission: string;
	shippingAddress: any;
	billingAddress: any;
	customerEmail: string;
	customerPhone: string | null;
	notes: string | null;
	createdAt: Date;
	updatedAt: Date;
	items: Array<{
		id: number;
		productId: number;
		productName: string;
		productSku: string;
		quantity: number;
		unitPrice: string;
		totalPrice: string;
	}>;
}

export class OrderService {
	/**
	 * Create order from cart
	 */
	static async createOrder(params: CreateOrderParams): Promise<OrderDetails> {
		const { userId, sessionId, customerEmail, customerPhone, shippingAddress, billingAddress, notes } = params;

		// Get cart
		const cart = await CartService.getCart(userId, sessionId);
		if (!cart || cart.items.length === 0) {
			throw new Error('Cart is empty');
		}

		// Validate stock for all items
		for (const item of cart.items) {
			if (item.product.trackInventory && item.product.stockQuantity < item.quantity) {
				throw new Error(`Insufficient stock for ${item.product.name}`);
			}
		}

		// Generate order number
		const orderNumber = await this.generateOrderNumber();

		// Calculate totals
		const subtotalAmount = cart.totalAmount;
		const taxAmount = 0; // TODO: Implement tax calculation
		const shippingAmount = 0; // TODO: Implement shipping calculation
		const discountAmount = 0; // TODO: Implement discount calculation
		const totalAmount = subtotalAmount + taxAmount + shippingAmount - discountAmount;

		// Create order
		const newOrder: typeof table.order.$inferInsert = {
			orderNumber,
			userId: userId || null,
			affiliateLinkId: cart.affiliateLinkId,
			status: 'pending',
			totalAmount: totalAmount.toFixed(2),
			subtotalAmount: subtotalAmount.toFixed(2),
			taxAmount: taxAmount.toFixed(2),
			shippingAmount: shippingAmount.toFixed(2),
			discountAmount: discountAmount.toFixed(2),
			affiliateCommission: '0.00', // Will be calculated if there's affiliate attribution
			shippingAddress: JSON.stringify(shippingAddress),
			billingAddress: JSON.stringify(billingAddress || shippingAddress),
			customerEmail,
			customerPhone,
			notes
		};

		const [order] = await db.insert(table.order).values(newOrder).returning();

		// Create order items
		const orderItems: Array<typeof table.orderItem.$inferInsert> = cart.items.map(item => ({
			orderId: order.id,
			productId: item.productId,
			productName: item.product.name,
			productSku: item.product.sku || `PROD-${item.productId}`,
			quantity: item.quantity,
			unitPrice: item.unitPrice,
			totalPrice: (parseFloat(item.unitPrice) * item.quantity).toFixed(2)
		}));

		await db.insert(table.orderItem).values(orderItems);

		// Update product stock quantities
		for (const item of cart.items) {
			if (item.product.trackInventory) {
				await db
					.update(table.product)
					.set({
						stockQuantity: item.product.stockQuantity - item.quantity,
						updatedAt: new Date()
					})
					.where(eq(table.product.id, item.productId));
			}
		}

		// Process affiliate commission if applicable
		if (cart.affiliateLinkId) {
			try {
				await AffiliateService.processConversion(order.id);
			} catch (error) {
				console.error('Failed to process affiliate conversion:', error);
				// Don't fail the order creation if affiliate processing fails
			}
		}

		// Clear cart
		await CartService.clearCart(userId, sessionId);

		// Return order details
		return await this.getOrderById(order.id);
	}

	/**
	 * Get order by ID
	 */
	static async getOrderById(orderId: number): Promise<OrderDetails> {
		const orderResult = await db
			.select()
			.from(table.order)
			.where(eq(table.order.id, orderId))
			.limit(1);

		if (orderResult.length === 0) {
			throw new Error('Order not found');
		}

		const order = orderResult[0];

		// Get order items
		const items = await db
			.select()
			.from(table.orderItem)
			.where(eq(table.orderItem.orderId, orderId));

		return {
			id: order.id,
			orderNumber: order.orderNumber,
			userId: order.userId,
			status: order.status as OrderStatus,
			totalAmount: order.totalAmount,
			subtotalAmount: order.subtotalAmount,
			taxAmount: order.taxAmount,
			shippingAmount: order.shippingAmount,
			discountAmount: order.discountAmount,
			affiliateCommission: order.affiliateCommission,
			shippingAddress: JSON.parse(order.shippingAddress || '{}'),
			billingAddress: JSON.parse(order.billingAddress || '{}'),
			customerEmail: order.customerEmail,
			customerPhone: order.customerPhone,
			notes: order.notes,
			createdAt: order.createdAt,
			updatedAt: order.updatedAt,
			items: items.map(item => ({
				id: item.id,
				productId: item.productId,
				productName: item.productName,
				productSku: item.productSku,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				totalPrice: item.totalPrice
			}))
		};
	}

	/**
	 * Get order by order number
	 */
	static async getOrderByNumber(orderNumber: string): Promise<OrderDetails | null> {
		const orderResult = await db
			.select()
			.from(table.order)
			.where(eq(table.order.orderNumber, orderNumber))
			.limit(1);

		if (orderResult.length === 0) {
			return null;
		}

		return await this.getOrderById(orderResult[0].id);
	}

	/**
	 * Get orders for user
	 */
	static async getUserOrders(
		userId: string,
		limit: number = 20,
		offset: number = 0
	): Promise<OrderSummary[]> {
		const orders = await db
			.select({
				id: table.order.id,
				orderNumber: table.order.orderNumber,
				status: table.order.status,
				totalAmount: table.order.totalAmount,
				createdAt: table.order.createdAt
			})
			.from(table.order)
			.where(eq(table.order.userId, userId))
			.orderBy(desc(table.order.createdAt))
			.limit(limit)
			.offset(offset);

		// Get item counts for each order
		const orderIds = orders.map(o => o.id);
		let itemCounts: { orderId: number; count: number }[] = [];
		
		if (orderIds.length > 0) {
			itemCounts = await db
				.select({
					orderId: table.orderItem.orderId,
					count: table.orderItem.quantity
				})
				.from(table.orderItem)
				.where(inArray(table.orderItem.orderId, orderIds));
		}

		// Group counts by order
		const countsByOrder = itemCounts.reduce((acc, item) => {
			acc[item.orderId] = (acc[item.orderId] || 0) + item.count;
			return acc;
		}, {} as Record<number, number>);

		return orders.map(order => ({
			id: order.id,
			orderNumber: order.orderNumber,
			status: order.status as OrderStatus,
			totalAmount: order.totalAmount,
			createdAt: order.createdAt,
			itemCount: countsByOrder[order.id] || 0
		}));
	}

	/**
	 * Get all orders for admin
	 */
	static async getAllOrders(
		limit: number = 50,
		offset: number = 0,
		status?: OrderStatus,
		search?: string
	): Promise<OrderSummary[]> {
		// Apply filters
		const conditions = [];
		if (status) {
			conditions.push(eq(table.order.status, status));
		}
		if (search) {
			conditions.push(
				or(
					eq(table.order.orderNumber, search),
					eq(table.order.customerEmail, search)
				)
			);
		}

		const baseQuery = db
			.select({
				id: table.order.id,
				orderNumber: table.order.orderNumber,
				status: table.order.status,
				totalAmount: table.order.totalAmount,
				createdAt: table.order.createdAt,
				customerEmail: table.order.customerEmail
			})
			.from(table.order);

		const orders = conditions.length > 0
			? await baseQuery
				.where(and(...conditions))
				.orderBy(desc(table.order.createdAt))
				.limit(limit)
				.offset(offset)
			: await baseQuery
				.orderBy(desc(table.order.createdAt))
				.limit(limit)
				.offset(offset);

		// Get item counts
		const orderIds = orders.map(o => o.id);
		let itemCounts: { orderId: number; count: number }[] = [];
		
		if (orderIds.length > 0) {
			itemCounts = await db
				.select({
					orderId: table.orderItem.orderId,
					count: table.orderItem.quantity
				})
				.from(table.orderItem)
				.where(inArray(table.orderItem.orderId, orderIds));
		}

		const countsByOrder = itemCounts.reduce((acc, item) => {
			acc[item.orderId] = (acc[item.orderId] || 0) + item.count;
			return acc;
		}, {} as Record<number, number>);

		return orders.map(order => ({
			id: order.id,
			orderNumber: order.orderNumber,
			status: order.status as OrderStatus,
			totalAmount: order.totalAmount,
			createdAt: order.createdAt,
			itemCount: countsByOrder[order.id] || 0
		}));
	}

	/**
	 * Update order status
	 */
	static async updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
		await db
			.update(table.order)
			.set({ 
				status,
				updatedAt: new Date()
			})
			.where(eq(table.order.id, orderId));
	}

	/**
	 * Cancel order
	 */
	static async cancelOrder(orderId: number): Promise<void> {
		const order = await this.getOrderById(orderId);
		
		if (order.status === 'cancelled' || order.status === 'refunded') {
			throw new Error('Order is already cancelled or refunded');
		}

		if (order.status === 'shipped' || order.status === 'delivered') {
			throw new Error('Cannot cancel shipped or delivered order');
		}

		// Restore stock quantities
		for (const item of order.items) {
			const productResult = await db
				.select()
				.from(table.product)
				.where(eq(table.product.id, item.productId))
				.limit(1);

			if (productResult.length > 0 && productResult[0].trackInventory) {
				await db
					.update(table.product)
					.set({
						stockQuantity: productResult[0].stockQuantity + item.quantity,
						updatedAt: new Date()
					})
					.where(eq(table.product.id, item.productId));
			}
		}

		// Update order status
		await this.updateOrderStatus(orderId, 'cancelled');
	}

	/**
	 * Generate unique order number
	 */
	private static async generateOrderNumber(): Promise<string> {
		const timestamp = Date.now().toString().slice(-8);
		const random = Math.random().toString(36).substring(2, 6).toUpperCase();
		const orderNumber = `ORD-${timestamp}-${random}`;

		// Ensure uniqueness
		const existing = await db
			.select()
			.from(table.order)
			.where(eq(table.order.orderNumber, orderNumber))
			.limit(1);

		if (existing.length > 0) {
			// Recursive call if collision (very rare)
			return await this.generateOrderNumber();
		}

		return orderNumber;
	}
}

export default OrderService;
