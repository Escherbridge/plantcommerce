import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, adminProcedure, router } from './trpc';
import { OrderService, type OrderStatus } from '../services/order';

const addressSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	address1: z.string().min(1),
	address2: z.string().optional(),
	city: z.string().min(1),
	state: z.string().min(1),
	postalCode: z.string().min(1),
	country: z.string().min(1)
});

export const ordersRouter = router({
	/**
	 * Create order from cart (public for guest checkout)
	 */
	createOrder: publicProcedure
		.input(
			z.object({
				customerEmail: z.string().email(),
				customerPhone: z.string().optional(),
				shippingAddress: addressSchema,
				billingAddress: addressSchema.optional(),
				sessionId: z.string().optional(),
				notes: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const userId = ctx.user?.id;
				const { sessionId, ...orderData } = input;

				if (!userId && !sessionId) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Session ID required for guest checkout'
					});
				}

				const order = await OrderService.createOrder({
					userId,
					sessionId,
					...orderData
				});

				return order;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to create order'
				});
			}
		}),

	/**
	 * Get order by order number (public for order tracking)
	 */
	getOrderByNumber: publicProcedure
		.input(
			z.object({
				orderNumber: z.string(),
				email: z.string().email().optional() // For guest order verification
			})
		)
		.query(async ({ input }) => {
			try {
				const order = await OrderService.getOrderByNumber(input.orderNumber);
				
				if (!order) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Order not found'
					});
				}

				// If email is provided and order has no user ID, verify email matches
				if (input.email && !order.userId && order.customerEmail !== input.email) {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'Access denied'
					});
				}

				return order;
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve order'
				});
			}
		}),

	/**
	 * Get order by ID (protected - user can only access their own orders)
	 */
	getOrder: protectedProcedure
		.input(z.object({ orderId: z.number() }))
		.query(async ({ ctx, input }) => {
			try {
				const order = await OrderService.getOrderById(input.orderId);

				// Verify user owns this order (or is admin)
				if (order.userId !== ctx.user.id && ctx.user.role !== 'admin') {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'Access denied'
					});
				}

				return order;
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Order not found'
				});
			}
		}),

	/**
	 * Get user's orders (protected)
	 */
	getUserOrders: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0)
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				const orders = await OrderService.getUserOrders(
					ctx.user.id,
					input.limit,
					input.offset
				);
				return orders;
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve orders'
				});
			}
		}),

	/**
	 * Cancel order (protected - user can cancel their own orders)
	 */
	cancelOrder: protectedProcedure
		.input(z.object({ orderId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			try {
				// Verify user owns this order
				const order = await OrderService.getOrderById(input.orderId);
				if (order.userId !== ctx.user.id && ctx.user.role !== 'admin') {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'Access denied'
					});
				}

				await OrderService.cancelOrder(input.orderId);
				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to cancel order'
				});
			}
		}),

	/**
	 * Get all orders for admin management (admin only)
	 */
	getAllOrders: adminProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
				status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
				search: z.string().optional()
			})
		)
		.query(async ({ input }) => {
			try {
				const orders = await OrderService.getAllOrders(
					input.limit,
					input.offset,
					input.status as OrderStatus | undefined,
					input.search
				);
				return orders;
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve orders'
				});
			}
		}),

	/**
	 * Update order status (admin only)
	 */
	updateOrderStatus: adminProcedure
		.input(
			z.object({
				orderId: z.number(),
				status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
			})
		)
		.mutation(async ({ input }) => {
			try {
				await OrderService.updateOrderStatus(
					input.orderId,
					input.status as OrderStatus
				);
				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to update order status'
				});
			}
		}),

	/**
	 * Get order details for admin (admin only)
	 */
	getOrderDetails: adminProcedure
		.input(z.object({ orderId: z.number() }))
		.query(async ({ input }) => {
			try {
				const order = await OrderService.getOrderById(input.orderId);
				return order;
			} catch (error) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Order not found'
				});
			}
		})
});

export type OrdersRouter = typeof ordersRouter;
