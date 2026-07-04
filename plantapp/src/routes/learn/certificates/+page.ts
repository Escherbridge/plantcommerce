import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const certificates = await trpc.lms.certificate.myCertificates.query();
		return { certificates: certificates ?? [] };
	} catch (e) {
		console.error('Error loading certificates:', e);
		return { certificates: [] };
	}
};
