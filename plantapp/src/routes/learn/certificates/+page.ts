import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const { user } = await event.parent();
	if (!user) return { signedOut: true, certificates: [] };

	const trpc = createCallerClient(event.fetch);
	try {
		const certificates = await trpc.lms.certificate.myCertificates.query();
		return { signedOut: false, certificates: certificates ?? [] };
	} catch (cause) {
		console.error(
			'Error loading certificates:',
			cause instanceof Error ? cause.message : 'Request failed'
		);
		return { signedOut: false, certificates: [] };
	}
};
