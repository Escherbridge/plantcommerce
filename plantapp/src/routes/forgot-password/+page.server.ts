import type { Actions } from './$types';
import { noJsCredentialPost } from '$lib/server/noJsCredentialPost';

export const actions: Actions = {
	default: () => noJsCredentialPost()
};
