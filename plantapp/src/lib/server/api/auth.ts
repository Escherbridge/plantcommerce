import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from './trpc';
import { UserService, type UserProfile } from '../services/user';
import { CartService } from '../services/cart';
import { invalidateSession, generateEmailVerificationToken } from '../auth';
import { AuditLogService } from '../services/auditLog';
import type { Session } from '../db/schema';
import { EmailService } from '../services/email';

const transferCartSafely = async (sessionId: string, userId: string) => {
	try {
		await CartService.transferGuestCart(sessionId, userId);
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
	session: {
		id: session.id,
		expiresAt: session.expiresAt
	}
});

export const authRouter = router({
	register: publicProcedure
		.input(z.object({
			username: z.string().min(3).max(50),
			email: z.string().email(),
			password: z.string().min(8),
			firstName: z.string().optional(),
			lastName: z.string().optional(),
			guestSessionId: z.string().optional()
		}))
		.mutation(async ({ input }) => {
			const { guestSessionId, ...userData } = input;
			const user = await UserService.createUser(userData);

			await AuditLogService.log(user.id, 'register', { email: user.email });

			// Send verification email
			try {
				const token = await generateEmailVerificationToken(user.id, user.email);
				await EmailService.sendVerificationEmail(user.email, token);
			} catch (error) {
				console.error('Failed to send verification email:', error);
				// Don't fail registration if email fails, just log it
			}

			const loginResult = await UserService.login({
				usernameOrEmail: user.email,
				password: input.password
			});

			if (guestSessionId) {
				await transferCartSafely(guestSessionId, user.id);
			}

			return {
				user: loginResult.user,
				sessionToken: loginResult.sessionToken
			};
		}),

	login: publicProcedure
		.input(z.object({
			usernameOrEmail: z.string().min(1),
			password: z.string().min(1),
			guestSessionId: z.string().optional()
		}))
		.mutation(async ({ input }) => {
			const { guestSessionId, ...loginData } = input;
			const result = await UserService.login(loginData);

			await AuditLogService.log(result.user.id, 'login_success');

			if (guestSessionId) {
				await transferCartSafely(guestSessionId, result.user.id);
			}

			return result;
		}),

	logout: protectedProcedure.mutation(async ({ ctx }) => {
		if (ctx.session) {
			await invalidateSession(ctx.session.id);
			await AuditLogService.log(ctx.user.id, 'logout');
		}
		return { success: true };
	}),

	getSession: protectedProcedure.query(async ({ ctx }) =>
		formatUserResponse(ctx.user, ctx.session)
	),

	refreshSession: protectedProcedure.mutation(async ({ ctx }) =>
		formatUserResponse(ctx.user, ctx.session)
	),

	checkUsernameAvailability: publicProcedure
		.input(z.object({ username: z.string().min(3).max(50) }))
		.query(async ({ input }) => ({
			available: await UserService.isUsernameAvailable(input.username)
		})),

	checkEmailAvailability: publicProcedure
		.input(z.object({ email: z.string().email() }))
		.query(async ({ input }) => ({
			available: await UserService.isEmailAvailable(input.email)
		}))
});

export type AuthRouter = typeof authRouter;
