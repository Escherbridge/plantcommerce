import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64urlNoPadding, encodeHexLowerCase } from '@oslojs/encoding';

/** 32 cryptographically random bytes, base64url, with no padding. */
export const INVITE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function generateInviteToken(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return encodeBase64urlNoPadding(bytes);
}

/** SHA-256 hex digest. Public lookup uses this, never the raw token. */
export function hashInviteToken(token: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export function isInviteToken(value: string): boolean {
	return INVITE_TOKEN_PATTERN.test(value);
}
