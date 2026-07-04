import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const { uid } = event.params;

	try {
		const certificate = await trpc.lms.certificate.verify.query({ uid });
		return { certificate, uid };
	} catch (e) {
		console.error('Error verifying certificate:', e);
		return { certificate: null, uid };
	}
};
