import { describe, expect, it } from 'vitest';
import { decideSellerApplicationsAdminAccess, parseSellerApplicationSince } from './adminAccess';

const token = 'seller-admin-token-that-is-not-a-password';

describe('seller application admin access', () => {
	it('returns 503 when the admin token is unset or blank', () => {
		expect(decideSellerApplicationsAdminAccess(`Bearer ${token}`, undefined)).toEqual({
			status: 503
		});
		expect(decideSellerApplicationsAdminAccess(`Bearer ${token}`, '')).toEqual({ status: 503 });
		expect(decideSellerApplicationsAdminAccess(`Bearer ${token}`, '   ')).toEqual({ status: 503 });
	});

	it('returns 401 when the bearer token is missing', () => {
		expect(decideSellerApplicationsAdminAccess(null, token)).toEqual({ status: 401 });
		expect(decideSellerApplicationsAdminAccess('', token)).toEqual({ status: 401 });
		expect(decideSellerApplicationsAdminAccess('Bearer', token)).toEqual({ status: 401 });
		expect(decideSellerApplicationsAdminAccess('Basic ' + token, token)).toEqual({ status: 401 });
		expect(decideSellerApplicationsAdminAccess(token, token)).toEqual({ status: 401 });
	});

	it('returns 401 for a wrong bearer token, including different lengths', () => {
		expect(decideSellerApplicationsAdminAccess('Bearer wrong-token', token)).toEqual({
			status: 401
		});
		expect(decideSellerApplicationsAdminAccess('Bearer seller-admin', token)).toEqual({
			status: 401
		});
		expect(decideSellerApplicationsAdminAccess(`Bearer ${token}-extra-characters`, token)).toEqual({
			status: 401
		});
		expect(decideSellerApplicationsAdminAccess(`Bearer ${token.toUpperCase()}`, token)).toEqual({
			status: 401
		});
	});

	it('accepts the configured bearer token in constant time without an origin check', () => {
		expect(decideSellerApplicationsAdminAccess(`Bearer ${token}`, token)).toEqual({ status: 200 });
		expect(decideSellerApplicationsAdminAccess(`bearer ${token}`, `  ${token}  `)).toEqual({
			status: 200
		});
	});

	it('parses an ISO-8601 timestamp cursor and rejects ambiguous values', () => {
		expect(parseSellerApplicationSince('2026-11-10T05:24:00.000Z')?.toISOString()).toBe(
			'2026-11-10T05:24:00.000Z'
		);
		expect(parseSellerApplicationSince('2026-11-10T00:24:00-05:00')?.toISOString()).toBe(
			'2026-11-10T05:24:00.000Z'
		);
		expect(parseSellerApplicationSince('2026-11-10')).toBeNull();
		expect(parseSellerApplicationSince('2026-11-10T05:24:00')).toBeNull();
		expect(parseSellerApplicationSince('2026-02-31T00:00:00Z')).toBeNull();
		expect(parseSellerApplicationSince('not-a-date')).toBeNull();
	});
});
