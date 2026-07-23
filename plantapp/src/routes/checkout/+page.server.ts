import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getCommerceAdapter } from '$lib/server/commerce/adapter';

export const load: PageServerLoad = async (event) => {
	const adapter = await getCommerceAdapter(event);
	try {
		return { context: adapter.context, review: await adapter.getCheckoutReview(event) };
	} catch {
		throw redirect(303, '/cart');
	}
};

export const actions: Actions = {
	submit: async (event) => {
		const data = await event.request.formData();
		const idempotencyKey = data.get('idempotencyKey');
		if (typeof idempotencyKey !== 'string') throw error(400, 'Invalid checkout review');
		const adapter = await getCommerceAdapter(event);
		const submission = await adapter.submitCheckout(event, idempotencyKey);
		throw redirect(
			303,
			submission.kind === 'redirect'
				? submission.url
				: `/checkout/success?order=${encodeURIComponent(submission.reference)}`
		);
	}
};
