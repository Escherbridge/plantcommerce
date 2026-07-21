import { env } from '$env/dynamic/private';
import { error, json } from '@sveltejs/kit';
import { getPublicCatalogAvailability } from '$lib/server/catalogTruth/publicCatalog';
import { GuestOrderAccessService } from '$lib/server/guestOrderAccess';
import { CheckoutPaymentService } from '$lib/server/services/checkoutPayment';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	const catalogAvailability = getPublicCatalogAvailability();
	if (catalogAvailability.status !== 'available') {
		throw error(503, catalogAvailability.reason);
	}

	if (env.SECURE_CHECKOUT_ENABLED !== 'true') {
		throw error(503, 'Checkout is temporarily unavailable while secure payment processing is being updated.');
	}

	const buyer = locals.user
		? { kind: 'user' as const, userId: locals.user.id }
		: locals.guestCartSessionId
			? { kind: 'guest' as const, guestCartSessionId: locals.guestCartSessionId }
			: null;
	if (!buyer) {
		throw error(400, 'Add an item to a cart before starting checkout.');
	}

	try {
		const session = await CheckoutPaymentService.createOrReuseSession(buyer);
		if (buyer.kind === 'guest') {
			const grant = await GuestOrderAccessService.issueForDraft(session.draftId);
			GuestOrderAccessService.setCookie(cookies, grant);
		}

		return json({ url: session.checkoutUrl });
	} catch {
		throw error(400, 'Unable to start secure checkout. Please review your cart and try again.');
	}
};
