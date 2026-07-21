import { z } from 'zod';
import type { RequestEvent } from '@sveltejs/kit';
import { publicProcedure, protectedProcedure, router } from './trpc';
import {
	isEmailLoginIdentifier,
	normalizeEmailAddress,
	UserService,
	type UserProfile
} from '../services/user';
import { CartService } from '../services/cart';
import {
	createSession,
	deleteSessionTokenCookie,
	accountCapabilitiesEnabled,
	generateEmailChangeCapabilities,
	generateEmailVerificationToken,
	generatePasswordResetToken,
	generateSessionToken,
	invalidateSession,
	setSessionTokenCookie,
	toPublicSession
} from '../auth';
import { deleteGuestCartSessionCookie, readGuestCartSessionId } from '../guestCart';
import { AuditLogService } from '../services/auditLog';
import type { Session } from '../db/schema';
import { EmailService } from '../services/email';
import { LoginProtectionService } from '../services/loginProtection';
import { TRPCError } from '@trpc/server';

const transferCurrentGuestCartSafely = async (
	cookies: Parameters<typeof readGuestCartSessionId>[0],
	userId: string
) => {
	const sessionId = readGuestCartSessionId(cookies);
	if (!sessionId) {
		return;
	}

	try {
		await CartService.transferGuestCart(sessionId, userId);
		deleteGuestCartSessionCookie(cookies);
	} catch {
		console.warn('Failed to transfer guest cart');
	}
};

const formatUserResponse = (user: UserProfile, session: Session) => ({
	user: {
		id: user.id,
		username: user.username,
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
		role: user.role,
		isActive: user.isActive,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt
	},
	session: toPublicSession(session)
});

function clientAddress(event: RequestEvent): string {
	try {
		return event.getClientAddress();
	} catch {
		return 'unavailable';
	}
}

export const authRouter = router({
	register: publicProcedure
		.input(
			z.object({
				username: z
					.string()
					.min(3)
					.max(50)
					.refine((value) => !isEmailLoginIdentifier(value), 'Username cannot be an email address'),
				email: z.string().email(),
				password: z.string().min(8),
				firstName: z.string().optional(),
				lastName: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			let user: UserProfile;
			try {
				user = await UserService.createUser(input);
			} catch {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'We could not create an account with those details.'
				});
			}

			await AuditLogService.log(user.id, 'register', { email: user.email });

			let verificationEmailSent = false;
			if (accountCapabilitiesEnabled()) {
				try {
					const token = await generateEmailVerificationToken(user.id, user.email);
					if (token) {
						await EmailService.sendVerificationEmail(user.email, token);
						verificationEmailSent = true;
					}
				} catch (error) {
					console.error('Failed to send verification email:', error);
				}
			}

			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, user.id);
			setSessionTokenCookie(ctx.event, sessionToken, session.expiresAt);
			await transferCurrentGuestCartSafely(ctx.event.cookies, user.id);

			return { ...formatUserResponse(user, session), verificationEmailSent };
		}),

	login: publicProcedure
		.input(
			z.object({
				usernameOrEmail: z.string().min(1),
				password: z.string().min(1)
			})
		)
		.mutation(async ({ ctx, input }) => {
			const ipAddress = clientAddress(ctx.event);
			let loginResult;
			try {
				const accountIdentity = await UserService.getLoginThrottleIdentity(input.usernameOrEmail);
				const allowed = await LoginProtectionService.beginLoginAttempt(ipAddress, accountIdentity);
				if (!allowed) {
					throw new Error('Rate limit exceeded');
				}
				loginResult = await UserService.login(input);
				await LoginProtectionService.clearSuccessfulLogin(accountIdentity);
			} catch (error) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'Invalid username/email or password'
				});
			}

			const { user } = loginResult;
			await AuditLogService.log(user.id, 'login_success');

			const sessionToken = generateSessionToken();
			const session = await createSession(sessionToken, user.id);
			setSessionTokenCookie(ctx.event, sessionToken, session.expiresAt);
			await transferCurrentGuestCartSafely(ctx.event.cookies, user.id);

			return formatUserResponse(user, session);
		}),

	requestPasswordReset: publicProcedure
		.input(z.object({ email: z.string().email() }))
		.mutation(async ({ ctx, input }) => {
			const ipAddress = clientAddress(ctx.event);
			const requestedEmail = normalizeEmailAddress(input.email);
			const deliveryAvailable = accountCapabilitiesEnabled() && EmailService.isConfigured();
			try {
				if (deliveryAvailable) {
					const allowed = await LoginProtectionService.beginPasswordResetRequest(ipAddress, requestedEmail);
					if (!allowed) {
						return {
							success: true,
							deliveryAvailable: true,
							message: 'If an eligible account exists, password reset instructions will arrive shortly.'
						};
					}

					const user = await UserService.getUserByEmail(requestedEmail);
					if (user?.isActive) {
						try {
							const token = await generatePasswordResetToken(user.id, user.email);
							if (token) {
								await EmailService.sendPasswordResetEmail(user.email, token);
								await AuditLogService.log(user.id, 'password_reset_requested');
							}
						} catch (error) {
							console.error('Failed to send password reset email:', error);
						}
					}
				}
			} catch (error) {
				console.error('Failed to process password reset request:', error);
			}

			return {
				success: true,
				deliveryAvailable,
				message: deliveryAvailable
					? 'If an eligible account exists, password reset instructions will arrive shortly.'
					: 'Password recovery email is temporarily unavailable. Please contact support.'
			};
		}),

	requestEmailVerification: protectedProcedure.mutation(async ({ ctx }) => {
		const deliveryAddress = ctx.user.pendingEmail ?? ctx.user.email;
		const deliveryAvailable = accountCapabilitiesEnabled() && EmailService.isConfigured();
		if (!deliveryAvailable) {
			return {
				deliveryAvailable: false,
				message: 'Verification email is temporarily unavailable. Please contact support.'
			};
		}

		if (ctx.user.emailVerified && !ctx.user.pendingEmail) {
			return { deliveryAvailable: true, message: 'Your email address is already verified.' };
		}

		try {
			const allowed = await LoginProtectionService.beginEmailVerificationRequest(
				clientAddress(ctx.event),
				deliveryAddress
			);
			if (!allowed) {
				return { deliveryAvailable: true, message: 'Please wait before requesting another verification email.' };
			}

			if (ctx.user.pendingEmail) {
				const capabilities = await generateEmailChangeCapabilities(
					ctx.user.id,
					ctx.user.email,
					ctx.user.pendingEmail
				);
				if (capabilities) {
					await EmailService.sendNewEmailChangeProof(ctx.user.pendingEmail, capabilities.newEmailToken);
					await EmailService.sendExistingEmailChangeConfirmation(
						ctx.user.email,
						ctx.user.pendingEmail,
						capabilities.existingEmailToken
					);
					await AuditLogService.log(ctx.user.id, 'email_verification_requested');
				}
			} else {
				const token = await generateEmailVerificationToken(ctx.user.id, deliveryAddress);
				if (token) {
					await EmailService.sendVerificationEmail(deliveryAddress, token);
					await AuditLogService.log(ctx.user.id, 'email_verification_requested');
				}
			}
			return { deliveryAvailable: true, message: 'Verification instructions were sent.' };
		} catch (error) {
			console.error('Failed to send verification email:', error);
			return {
				deliveryAvailable: false,
				message: 'Verification email is temporarily unavailable. Please contact support.'
			};
		}
	}),

	resetPassword: publicProcedure
		.input(z.object({ token: z.string().min(1).max(128), password: z.string().min(8).max(256) }))
		.mutation(async ({ ctx, input }) => {
			if (!accountCapabilitiesEnabled()) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'This password reset link is invalid or expired.'
				});
			}

			let allowed = false;
			try {
				allowed = await LoginProtectionService.beginPasswordResetCompletion(clientAddress(ctx.event), input.token);
			} catch {
				allowed = false;
			}
			if (!allowed) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'This password reset link is invalid or expired.'
				});
			}

			const userId = await UserService.resetPasswordWithRecoveryToken(input.token, input.password);
			if (!userId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'This password reset link is invalid or expired.'
				});
			}

			await AuditLogService.log(userId, 'password_reset_completed');
			return { success: true };
		}),

	logout: protectedProcedure.mutation(async ({ ctx }) => {
		if (ctx.session) {
			await invalidateSession(ctx.session.id);
			await AuditLogService.log(ctx.user.id, 'logout');
			deleteSessionTokenCookie(ctx.event);
		}
		return { success: true };
	}),

	getSession: protectedProcedure.query(async ({ ctx }) =>
		formatUserResponse(ctx.user, ctx.session)
	),

	refreshSession: protectedProcedure.mutation(async ({ ctx }) =>
		formatUserResponse(ctx.user, ctx.session)
	),

});

export type AuthRouter = typeof authRouter;
