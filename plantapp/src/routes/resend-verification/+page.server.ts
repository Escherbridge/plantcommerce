import type { PageServerLoad } from './$types';
import { verificationEmailAvailable } from '$lib/server/verificationEmailAvailable';

/** Copy signal only. Auth, throttles, and verification tokens are unchanged. */
export const load: PageServerLoad = () => {
	return { verificationEmailAvailable: verificationEmailAvailable() };
};
