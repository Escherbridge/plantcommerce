import type { PageServerLoad } from './$types';
import { getCommerceAdapter } from '$lib/server/commerce/adapter';

export const load: PageServerLoad = async (event) => {
	const adapter = await getCommerceAdapter(event);
	const parsedPollAttempt = Number(event.url.searchParams.get('poll') ?? 0);
	const pollAttempt = Number.isSafeInteger(parsedPollAttempt)
		? Math.min(10, Math.max(0, parsedPollAttempt))
		: 0;
	if (adapter.context.mode === 'demo') {
		const reference = event.url.searchParams.get('order');
		const order = reference ? await adapter.getOrder(event, reference) : null;
		return {
			pollAttempt,
			context: adapter.context,
			demoOrder: order,
			databaseOrder: null,
			status: order ? ('complete' as const) : ('access_required' as const)
		};
	}

	const reference = event.url.searchParams.get('draft');
	if (!reference) {
		return {
			pollAttempt,
			context: adapter.context,
			demoOrder: null,
			databaseOrder: null,
			status: 'access_required' as const
		};
	}
	const [{ eq }, { db }, table, { GuestOrderAccessService }, { OrderService }] = await Promise.all([
		import('drizzle-orm'),
		import('$lib/server/db'),
		import('$lib/server/db/schema'),
		import('$lib/server/guestOrderAccess'),
		import('$lib/server/services/order')
	]);
	const [draft] = await db
		.select({ id: table.checkoutDraft.id, userId: table.checkoutDraft.userId })
		.from(table.checkoutDraft)
		.where(eq(table.checkoutDraft.reference, reference))
		.limit(1);
	if (!draft) {
		return {
			pollAttempt,
			context: adapter.context,
			demoOrder: null,
			databaseOrder: null,
			status: 'access_required' as const
		};
	}
	const isOwnerOrAdmin = Boolean(
		event.locals.user &&
			(event.locals.user.role === 'admin' || draft.userId === event.locals.user.id)
	);
	const hasGuestAccess = isOwnerOrAdmin
		? false
		: await GuestOrderAccessService.hasDraftAccess(event.cookies, draft.id);
	if (!isOwnerOrAdmin && !hasGuestAccess) {
		return {
			pollAttempt,
			context: adapter.context,
			demoOrder: null,
			databaseOrder: null,
			status: 'access_required' as const
		};
	}
	const [orderRecord] = await db
		.select({ id: table.order.id })
		.from(table.order)
		.where(eq(table.order.checkoutDraftId, draft.id))
		.limit(1);
	if (!orderRecord) {
		return {
			pollAttempt,
			context: adapter.context,
			demoOrder: null,
			databaseOrder: null,
			status: 'processing' as const
		};
	}
	return {
		pollAttempt,
		context: adapter.context,
		demoOrder: null,
		databaseOrder: await OrderService.getOrderById(orderRecord.id),
		status: 'complete' as const
	};
};
