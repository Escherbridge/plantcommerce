import { initTRPC, TRPCError } from '@trpc/server';
import type { RequestEvent } from '@sveltejs/kit';
import { validateSessionToken } from '../auth';
import { db } from '../db';
import * as table from '../db/schema';

export interface Context {
	event: RequestEvent;
	user: table.User | null;
	session: table.Session | null;
}

export async function createContext(event: RequestEvent): Promise<Context> {
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
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
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
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
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
});

export const affiliateProcedure = t.procedure.use(async ({ ctx, next }) => {
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
});

export const customerProcedure = t.procedure.use(async ({ ctx, next }) => {
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
});
