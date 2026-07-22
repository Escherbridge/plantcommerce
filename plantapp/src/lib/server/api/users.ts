import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, adminProcedure, router } from './trpc';
import {
	isEmailLoginIdentifier,
	normalizeEmailAddress,
	UserService,
	type UserProfile
} from '../services/user';
import { OrderService } from '../services/order';
import { accountCapabilitiesEnabled, generateEmailChangeCapabilities } from '../auth';
import { EmailService } from '../services/email';
import { AuditLogService } from '../services/auditLog';
import {
	assertPublicCatalogAvailable,
	getPublicCatalogAvailability
} from '../catalogTruth/publicCatalog';

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
				currentPassword: z.string().min(1).optional(),
				username: z
					.string()
					.min(3)
					.refine((value) => !isEmailLoginIdentifier(value), 'Username cannot be an email address')
					.optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const { email, currentPassword, ...profileInput } = input;
				const normalizedEmail = email === undefined ? undefined : normalizeEmailAddress(email);
				const emailChanged = normalizedEmail !== undefined && normalizedEmail !== ctx.user.email;
				if (emailChanged && !accountCapabilitiesEnabled()) {
					throw new TRPCError({
						code: 'PRECONDITION_FAILED',
						message: 'Email changes are temporarily unavailable.'
					});
				}
				if (emailChanged && (!currentPassword || !EmailService.isConfigured())) {
					throw new TRPCError({
						code: 'PRECONDITION_FAILED',
						message: currentPassword
							? 'Email changes are temporarily unavailable.'
							: 'Enter your current password to change your email.'
					});
				}

				let updatedUser: UserProfile;
				let verificationEmailSent = false;
				if (emailChanged && normalizedEmail && currentPassword) {
					const change = await UserService.requestEmailChange(
						ctx.user.id,
						normalizedEmail,
						currentPassword,
						profileInput
					);
					updatedUser = change.user;
					try {
						const capabilities = await generateEmailChangeCapabilities(
							updatedUser.id,
							change.previousEmail,
							normalizedEmail
						);
						if (capabilities) {
							await EmailService.sendNewEmailChangeProof(
								normalizedEmail,
								capabilities.newEmailToken
							);
							await EmailService.sendExistingEmailChangeConfirmation(
								change.previousEmail,
								normalizedEmail,
								capabilities.existingEmailToken
							);
							await AuditLogService.log(updatedUser.id, 'email_verification_requested');
							verificationEmailSent = true;
						}
					} catch (error) {
						console.error('Failed to send changed-email verification:', error);
					}
				} else {
					updatedUser = await UserService.updateProfile(ctx.user.id, profileInput);
				}

				return { ...updatedUser, verificationEmailSent };
			} catch (error) {
				if (error instanceof TRPCError) throw error;
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
				const orders = await OrderService.getUserOrders(ctx.user.id, input.limit, input.offset);
				return orders;
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to retrieve order history'
				});
			}
		}),

	/**
	 * Get user's wishlist (protected)
	 */
	getWishlist: protectedProcedure.query(async ({ ctx }) => {
		try {
			if (getPublicCatalogAvailability().status !== 'available') {
				return [];
			}
			return await UserService.getWishlist(ctx.user.id);
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to retrieve wishlist'
			});
		}
	}),

	/**
	 * Add product to wishlist (protected)
	 */
	addToWishlist: protectedProcedure
		.input(z.object({ productId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			try {
				assertPublicCatalogAvailable();
				const item = await UserService.addToWishlist(ctx.user.id, input.productId);
				return { success: true, item };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to add to wishlist'
				});
			}
		}),

	/**
	 * Remove product from wishlist (protected)
	 */
	removeFromWishlist: protectedProcedure
		.input(z.object({ productId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			try {
				await UserService.removeFromWishlist(ctx.user.id, input.productId);
				return { success: true };
			} catch (error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error instanceof Error ? error.message : 'Failed to remove from wishlist'
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
				role: z.enum(['admin', 'customer', 'affiliate', 'instructor']).optional(),
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
	getUserById: adminProcedure.input(z.object({ userId: z.string() })).query(async ({ input }) => {
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
				role: z.enum(['admin', 'customer', 'affiliate', 'instructor'])
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
	deleteUser: adminProcedure.input(z.object({ userId: z.string() })).mutation(async ({ input }) => {
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
