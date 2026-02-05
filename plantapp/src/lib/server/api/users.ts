import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, adminProcedure, router } from './trpc';
import { UserService } from '../services/user';
import { OrderService } from '../services/order';

export const usersRouter = router({
	/**
	 * Get current user profile (protected)
	 */
	getProfile: protectedProcedure.query(async ({ ctx }) => {
		try {
			const user = await UserService.getUserById(ctx.user.id);

			if (!user) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not found'
				});
			}

			return user;
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to retrieve profile'
			});
		}
	}),

	/**
	 * Update user profile (protected)
	 */
	updateProfile: protectedProcedure
		.input(
			z.object({
				firstName: z.string().optional(),
				lastName: z.string().optional(),
				email: z.string().email().optional(),
				username: z.string().min(3).optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const updatedUser = await UserService.updateProfile(ctx.user.id, input);
				return updatedUser;
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to update profile'
				});
			}
		}),

	/**
	 * Change password (protected)
	 */
	changePassword: protectedProcedure
		.input(
			z.object({
				currentPassword: z.string().min(1),
				newPassword: z.string().min(8)
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await UserService.changePassword(ctx.user.id, input);
				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to change password'
				});
			}
		}),

	/**
	 * Get user's order history (protected)
	 */
	getOrderHistory: protectedProcedure
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
					message: 'Failed to retrieve order history'
				});
			}
		}),

	/**
	 * Get all users for admin management (admin only)
	 */
	getAllUsers: adminProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
				role: z.enum(['admin', 'customer', 'affiliate']).optional(),
				search: z.string().optional(),
				isActive: z.boolean().optional()
			})
		)
		.query(async ({ input }) => {
			try {
				const users = await UserService.getAllUsers(
					input.limit,
					input.offset,
					input.role,
					input.search,
					input.isActive
				);
				return users;
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve users'
				});
			}
		}),

	/**
	 * Get user by ID (admin only)
	 */
	getUserById: adminProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ input }) => {
			try {
				const user = await UserService.getUserById(input.userId);

				if (!user) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'User not found'
					});
				}

				return user;
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve user'
				});
			}
		}),

	/**
	 * Update user status (admin only)
	 */
	updateUserStatus: adminProcedure
		.input(
			z.object({
				userId: z.string(),
				isActive: z.boolean()
			})
		)
		.mutation(async ({ input }) => {
			try {
				await UserService.updateUserStatus(input.userId, input.isActive);
				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Failed to update user status'
				});
			}
		}),

	/**
	 * Update user role (admin only)
	 */
	updateUserRole: adminProcedure
		.input(
			z.object({
				userId: z.string(),
				role: z.enum(['admin', 'customer', 'affiliate'])
			})
		)
		.mutation(async ({ input }) => {
			try {
				await UserService.updateUserRole(input.userId, input.role);
				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Failed to update user role'
				});
			}
		}),

	/**
	 * Delete user account (admin only)
	 */
	deleteUser: adminProcedure
		.input(z.object({ userId: z.string() }))
		.mutation(async ({ input }) => {
			try {
				await UserService.deleteUser(input.userId);
				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Failed to delete user'
				});
			}
		}),

	/**
	 * Get user statistics (admin only)
	 */
	getUserStats: adminProcedure.query(async () => {
		try {
			const stats = await UserService.getUserStats();
			return stats;
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to retrieve user statistics'
			});
		}
	})
});

export type UsersRouter = typeof usersRouter;
