import type { PageServerLoad } from './$types';
import { OrderService } from '$lib/server/services/order';

export const load: PageServerLoad = async ({ url }) => {
	const sessionId = url.searchParams.get('session_id');

	if (!sessionId) {
		return {
			order: null,
			status: 'no_session'
		};
	}

	// Try to find the order by Stripe session ID
	const order = await OrderService.getOrderByStripeSessionId(sessionId);

	if (!order) {
		// The webhook might not have fired yet — return a processing state
		return {
			order: null,
			stripeSessionId: sessionId,
			status: 'processing'
		};
	}

	return {
		order,
		status: 'complete'
	};
};
