import { describe, expect, it } from 'vitest';
import { authHandoffHref, safeRedirectPath } from './safeRedirect';

const origin = 'https://aevani.com';
const fallback = '/account/profile';

describe('safeRedirectPath', () => {
	it('keeps a same-origin path, including the resend-verification return', () => {
		expect(safeRedirectPath('/resend-verification', origin)).toBe('/resend-verification');
		expect(safeRedirectPath('/resend-verification?from=email#link', origin)).toBe(
			'/resend-verification?from=email#link'
		);
		expect(safeRedirectPath('/account/orders', origin)).toBe('/account/orders');
	});

	it('rejects absolute, protocol-relative, and backslash targets', () => {
		const blocked = [
			'https://evil.com',
			'https://aevani.com/resend-verification',
			'//evil.com',
			'///evil.com',
			'//aevani.com.evil.com/resend-verification',
			'/\\evil.com',
			'/\\\\evil.com',
			'/\t/evil.com',
			'\\/resend-verification',
			'javascript:alert(1)',
			'https://aevani.com@evil.com'
		];

		for (const value of blocked) {
			expect(safeRedirectPath(value, origin)).toBe(fallback);
		}
	});

	it('falls back when the value is missing', () => {
		expect(safeRedirectPath(null, origin)).toBe(fallback);
		expect(safeRedirectPath('', origin)).toBe(fallback);
		expect(safeRedirectPath(undefined, origin)).toBe(fallback);
	});

	it('keeps an affiliate join return on signup and sign-in', () => {
		expect(authHandoffHref('register', '/affiliate/join', origin)).toBe(
			'/register?redirect=%2Faffiliate%2Fjoin'
		);
		expect(authHandoffHref('login', '/affiliate/join', origin)).toBe(
			'/login?redirect=%2Faffiliate%2Fjoin'
		);
		expect(authHandoffHref('register', 'https://evil.com', origin)).toBe('/register');
		expect(authHandoffHref('login', null, origin)).toBe('/login');
	});

	it('never returns a url whose next parse leaves the origin', () => {
		const samples = [
			'/resend-verification',
			'//evil.com',
			'/\\evil.com',
			'/\t/evil.com',
			'/%2f%2fevil.com',
			'/%5c%5cevil.com',
			'/login?redirect=https://evil.com',
			'https://evil.com/resend-verification',
			'//aevani.com/resend-verification'
		];

		for (const value of samples) {
			const path = safeRedirectPath(value, origin);
			const resolved = new URL(path, origin);
			expect(resolved.origin).toBe(origin);
			expect(path.startsWith('//')).toBe(false);
			expect(path.includes('\\')).toBe(false);
		}
	});
});
