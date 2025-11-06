import { initTRPC, TRPCError } from '@trpc/server';
import type { RequestEvent } from '@sveltejs/kit';
import { validateSessionToken } from '../auth';
import { db } from '../db';
import * as table from '../db/schema';
import { handleError } from '$lib/utils/errorHandler';

export interface Context {
	event: RequestEvent;
	user: table.User | null;
	session: table.Session | null;
}

export async function createContext(event: RequestEvent): Promise<Context> {
	try {
		const sessionToken = event.cookies.get('auth-session');

		if (!sessionToken) {
			return {
				event,
				user: null,
				session: null
			};
		}

		const result = await validateSessionToken(sessionToken);

		return {
			event,
			user: result.user,
			session: result.session
		};
	} catch (error) {
		await handleError(error, {
			userId: event.locals.user?.id,
			url: event.url.pathname,
			method: event.request.method,
			userAgent: event.request.headers.get('user-agent'),
			ip: event.getClientAddress(),
		});
		throw error;
	}
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
	try {
		if (!ctx.user || !ctx.session) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'You must be logged in to access this resource'
			});
		}

		return next({
			ctx: {
				...ctx,
				user: ctx.user,
				session: ctx.session
			}
		});
	} catch (error) {
		await handleError(error, {
			userId: ctx.user?.id,
			url: ctx.event.url.pathname,
			method: ctx.event.request.method,
			userAgent: ctx.event.request.headers.get('user-agent'),
			ip: ctx.event.getClientAddress(),
		});
		throw error;
	}
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
	try {
		if (!ctx.user || !ctx.session) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'You must be logged in to access this resource'
			});
		}

		if (ctx.user.role !== 'admin') {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'You must be an admin to access this resource'
			});
		}

		return next({
			ctx: {
				...ctx,
				user: ctx.user,
				session: ctx.session
			}
		});
	} catch (error) {
		await handleError(error, {
			userId: ctx.user?.id,
			url: ctx.event.url.pathname,
			method: ctx.event.request.method,
			userAgent: ctx.event.request.headers.get('user-agent'),
			ip: ctx.event.getClientAddress(),
		});
		throw error;
	}
});

export const affiliateProcedure = t.procedure.use(async ({ ctx, next }) => {
	try {
		if (!ctx.user || !ctx.session) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'You must be logged in to access this resource'
			});
		}

		if (ctx.user.role !== 'affiliate' && ctx.user.role !== 'admin') {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'You must be an affiliate to access this resource'
			});
		}

		return next({
			ctx: {
				...ctx,
				user: ctx.user,
				session: ctx.session
			}
		});
	} catch (error) {
		await handleError(error, {
			userId: ctx.user?.id,
			url: ctx.event.url.pathname,
			method: ctx.event.request.method,
			userAgent: ctx.event.request.headers.get('user-agent'),
			ip: ctx.event.getClientAddress(),
		});
		throw error;
	}
});

export const customerProcedure = t.procedure.use(async ({ ctx, next }) => {
	try {
		if (!ctx.user || !ctx.session) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'You must be logged in to access this resource'
			});
		}

		if (!['customer', 'affiliate', 'admin'].includes(ctx.user.role)) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'Access denied'
			});
		}

		return next({
			ctx: {
				...ctx,
				user: ctx.user,
				session: ctx.session
			}
		});
	} catch (error) {
		await handleError(error, {
			userId: ctx.user?.id,
			url: ctx.event.url.pathname,
			method: ctx.event.request.method,
			userAgent: ctx.event.request.headers.get('user-agent'),
			ip: ctx.event.getClientAddress(),
		});
		throw error;
	}
});
