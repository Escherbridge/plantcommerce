import { eq, desc, and, or, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

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

	static async getOrderByNumberForUser(
		orderNumber: string,
		userId: string,
		isAdmin: boolean = false
	): Promise<OrderDetails | null> {
		const order = await this.getOrderByNumber(orderNumber);
		if (!order || (!isAdmin && order.userId !== userId)) {
			return null;
		}

		return order;
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
	 * Get order by Stripe session ID for internal idempotency checks.
	 */
	static async getOrderByStripeSessionId(stripeSessionId: string): Promise<OrderDetails | null> {
		const orderResult = await db
			.select()
			.from(table.order)
			.where(eq(table.order.stripeSessionId, stripeSessionId))
			.limit(1);

		if (orderResult.length === 0) {
			return null;
		}

		return await this.getOrderById(orderResult[0].id);
	}

	static async getOrderByStripeSessionIdForUser(
		stripeSessionId: string,
		userId: string,
		isAdmin: boolean = false
	): Promise<OrderDetails | null> {
		const order = await this.getOrderByStripeSessionId(stripeSessionId);
		if (!order || (!isAdmin && order.userId !== userId)) {
			return null;
		}

		return order;
	}
}

export default OrderService;
