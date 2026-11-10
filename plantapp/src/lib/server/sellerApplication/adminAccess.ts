import { createHash, timingSafeEqual } from 'node:crypto';

/** Private bearer credential for the owner forwarder. Unset or blank means the route is not configured. */
export const SELLER_APPLICATIONS_ADMIN_TOKEN_ENV = 'SELLER_APPLICATIONS_ADMIN_TOKEN';

const sincePattern =
	/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/;

export type SellerApplicationsAdminDecision = { status: 200 } | { status: 401 } | { status: 503 };

function configuredToken(value: string | undefined): string | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function bearerCredential(authorization: string | null): string | null {
	if (!authorization) return null;
	const match = /^Bearer\s+(\S+)\s*$/i.exec(authorization.trim());
	return match?.[1] ?? null;
}

/** Compare digests so unequal lengths still take the same comparison path. */
function constantTimeEqual(left: string, right: string): boolean {
	const leftDigest = createHash('sha256').update(left, 'utf8').digest();
	const rightDigest = createHash('sha256').update(right, 'utf8').digest();
	return timingSafeEqual(leftDigest, rightDigest);
}

/**
 * 503 when the admin token is unset. 401 when the bearer credential is missing or wrong.
 * A matching bearer token is accepted regardless of the request Origin.
 */
export function decideSellerApplicationsAdminAccess(
	authorization: string | null,
	token: string | undefined
): SellerApplicationsAdminDecision {
	const expected = configuredToken(token);
	if (!expected) return { status: 503 };

	const provided = bearerCredential(authorization);
	if (!provided || !constantTimeEqual(provided, expected)) return { status: 401 };
	return { status: 200 };
}

/** Strict timestamp cursor. Date-only values are rejected so the comparison stays unambiguous. */
export function parseSellerApplicationSince(value: string): Date | null {
	const match = sincePattern.exec(value);
	if (!match) return null;

	const [, year, month, day, hour, minute, second, fraction = '', zone] = match;
	const milliseconds = fraction.padEnd(3, '0').slice(0, 3);
	const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}.${milliseconds}${zone}`;
	const parsed = new Date(iso);
	if (Number.isNaN(parsed.getTime())) return null;

	const zoneOffset = zone === 'Z' ? 'Z' : zone;
	const asUtc = new Date(parsed.getTime());
	if (zoneOffset === 'Z') {
		if (
			asUtc.getUTCFullYear() !== Number(year) ||
			asUtc.getUTCMonth() + 1 !== Number(month) ||
			asUtc.getUTCDate() !== Number(day) ||
			asUtc.getUTCHours() !== Number(hour) ||
			asUtc.getUTCMinutes() !== Number(minute) ||
			asUtc.getUTCSeconds() !== Number(second)
		) {
			return null;
		}
	}

	return parsed;
}
