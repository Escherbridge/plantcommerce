import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from './trpc';
import { UserService, type UserProfile } from '../services/user';
import { CartService } from '../services/cart';
import { invalidateSession, generateEmailVerificationToken } from '../auth';
import { AuditLogService } from '../services/auditLog';
import type { Session } from '../db/schema';
import { EmailService } from '../services/email';
import { TRPCError } from '@trpc/server';
import { generateSessionToken, createSession, setSessionTokenCookie } from '../auth';

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
    .mutation(async ({ ctx, input }) => {
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

      // Create session and set cookie
      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, user.id);
      
      // Set the httpOnly cookie in the response
      if (ctx.event) {
        setSessionTokenCookie(ctx.event, sessionToken, session.expiresAt);
      }

      if (guestSessionId) {
        await transferCartSafely(guestSessionId, user.id);
      }

      return {
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
        sessionToken
      };
    }),

  login: publicProcedure
    .input(z.object({
      usernameOrEmail: z.string().min(1),
      password: z.string().min(1),
      guestSessionId: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { guestSessionId, ...loginData } = input;
      
      // Authenticate user
      const user = await UserService.authenticate(loginData.usernameOrEmail, loginData.password);
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid username/email or password'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Account is disabled'
        });
      }

      await AuditLogService.log(user.id, 'login_success');

      // Create session and set cookie
      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, user.id);
      
      // Set the httpOnly cookie in the response
      if (ctx.event) {
        setSessionTokenCookie(ctx.event, sessionToken, session.expiresAt);
      }

      if (guestSessionId) {
        await transferCartSafely(guestSessionId, user.id);
      }

      return {
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
        sessionToken
      };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.session) {
      await invalidateSession(ctx.session.id);
      await AuditLogService.log(ctx.user.id, 'logout');
      
      // Delete the cookie
      if (ctx.event) {
        ctx.event.cookies.delete('auth-session', { path: '/' });
      }
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
