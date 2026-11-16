import { SITE_URL } from '$lib/config/site';
import { isInviteToken } from './token';

export function invitePath(token: string): string {
	return `/invite/${token}`;
}

/** Staff copy uses the public origin from the spec, not the current host. */
export function inviteAbsoluteUrl(token: string): string {
	return `${SITE_URL}${invitePath(token)}`;
}

export function inviteTokenFromPath(path: string | null | undefined): string {
	if (!path) return '';
	const pathname = path.split(/[?#]/)[0] ?? '';
	const match = pathname.match(/^\/invite\/([A-Za-z0-9_-]+)\/?$/);
	return match && isInviteToken(match[1]) ? match[1] : '';
}
