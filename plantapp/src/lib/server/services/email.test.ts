import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/environment', () => ({ dev: false }));
vi.mock('$env/dynamic/private', () => ({
	env: {
		RESEND_API_KEY: 're_test_key',
		EMAIL_FROM: 'Aevani <support@aevani.example>'
	}
}));
vi.mock('$env/dynamic/public', () => ({
	env: {
		PUBLIC_BASE_URL: 'https://aevani.example'
	}
}));

import { EmailConfigurationError, EmailService } from './email';
import { env } from '$env/dynamic/private';

describe('EmailService', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('sends a verification capability through the configured provider without logging it', async () => {
		const token = 'A'.repeat(43);
		await EmailService.sendVerificationEmail('person@example.net', token);

		expect(fetch).toHaveBeenCalledWith(
			'https://api.resend.com/emails',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					Authorization: 'Bearer re_test_key',
					'User-Agent': 'aevani-auth/1.0'
				})
			})
		);

		const request = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
		expect(request.headers).not.toEqual(
			expect.objectContaining({ 'Idempotency-Key': expect.stringContaining(token) })
		);
		expect(String(request.body)).toContain('https://aevani.example/verify-email?token=');
		expect(String(request.body)).not.toContain('redirect=');
	});

	it('keeps a same-origin return path on the verification link', async () => {
		await EmailService.sendVerificationEmail(
			'person@example.net',
			'B'.repeat(43),
			'/affiliate/join'
		);
		const request = vi.mocked(fetch).mock.calls.at(-1)?.[1] as RequestInit;
		expect(String(request.body)).toContain(
			'https://aevani.example/verify-email?token=' +
				'B'.repeat(43) +
				'&redirect=%2Faffiliate%2Fjoin'
		);
	});

	it('fails explicitly when production sender configuration is absent', async () => {
		const originalKey = env.RESEND_API_KEY;
		env.RESEND_API_KEY = '';

		await expect(
			EmailService.sendVerificationEmail('person@example.net', 'A'.repeat(43))
		).rejects.toBeInstanceOf(EmailConfigurationError);

		env.RESEND_API_KEY = originalKey;
	});
});
