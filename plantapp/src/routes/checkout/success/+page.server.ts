import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { GuestOrderAccessService } from '$lib/server/guestOrderAccess';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { OrderService } from '$lib/server/services/order';

export const load: PageServerLoad = async ({ cookies, url, locals }) => {
	const reference = url.searchParams.get('draft');

	if (!reference) {
		return {
			order: null,
			status: 'access_required'
		};
	}

	const [draft] = await db
		.select({ id: table.checkoutDraft.id, userId: table.checkoutDraft.userId })
		.from(table.checkoutDraft)
		.where(eq(table.checkoutDraft.reference, reference))
		.limit(1);

	if (!draft) {
		return {
			order: null,
			status: 'access_required'
		};
	}

	const isOwnerOrAdmin = Boolean(locals.user && (
		locals.user.role === 'admin' || draft.userId === locals.user.id
	));
	const hasGuestAccess = isOwnerOrAdmin
		? false
		: await GuestOrderAccessService.hasDraftAccess(cookies, draft.id);

	if (!isOwnerOrAdmin && !hasGuestAccess) {
		return {
			order: null,
			status: 'access_required'
		};
	}

	const [orderRecord] = await db
		.select({ id: table.order.id })
		.from(table.order)
		.where(eq(table.order.checkoutDraftId, draft.id))
		.limit(1);

	if (!orderRecord) {
		// The webhook might not have completed yet; do not reveal this state before authorization.
		return {
			order: null,
			status: 'processing'
		};
	}

	const order = await OrderService.getOrderById(orderRecord.id);

	return {
		order,
		status: 'complete'
	};
};
