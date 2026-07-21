import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, adminProcedure, router } from './trpc';
import { OrderService, type OrderStatus } from '../services/order';

export const ordersRouter = router({
	getOrderByNumber: protectedProcedure
		.input(z.object({ orderNumber: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				const order = await OrderService.getOrderByNumberForUser(
					input.orderNumber,
					ctx.user.id,
					ctx.user.role === 'admin'
				);

				if (!order) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Order not found'
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
	 * Cancellation requires the reconciled payment-refund workflow.
	 */
	cancelOrder: protectedProcedure
		.input(z.object({ orderId: z.number() }))
		.mutation(async () => {
			throw new TRPCError({
				code: 'PRECONDITION_FAILED',
				message: 'Online order cancellation is temporarily unavailable. Please contact support.'
			});
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
			if (!['processing', 'shipped', 'delivered'].includes(input.status)) {
				throw new TRPCError({
					code: 'PRECONDITION_FAILED',
					message:
						'Only fulfillment status updates are available here. Payment, cancellation, and refund changes require their reconciled workflows.'
				});
			}

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
