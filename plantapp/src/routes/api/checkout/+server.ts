import { error, json } from '@sveltejs/kit';
import { getCommerceAdapter } from '$lib/server/commerce/adapter';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	try {
		const adapter = await getCommerceAdapter(event);
		let idempotencyKey = event.request.headers.get('idempotency-key') ?? 'database-checkout';
		if (event.request.headers.get('content-type')?.includes('application/json')) {
			const payload = (await event.request.json()) as { idempotencyKey?: unknown };
			if (typeof payload.idempotencyKey === 'string') idempotencyKey = payload.idempotencyKey;
		}
		const submission = await adapter.submitCheckout(event, idempotencyKey);
		return submission.kind === 'redirect'
			? json({ url: submission.url, mode: adapter.context.mode })
			: json({
					url: `/checkout/success?order=${encodeURIComponent(submission.reference)}`,
					mode: adapter.context.mode,
					reference: submission.reference
				});
	} catch (cause) {
		throw error(
			400,
			cause instanceof Error
				? cause.message
				: 'Unable to start checkout. Please review your cart and try again.'
		);
	}
};
