import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/environment', () => ({ dev: false, browser: false, building: false }));
vi.mock('$env/dynamic/private', () => ({
	env: {
		RESEND_API_KEY: 're_test_key',
		EMAIL_FROM: 'Aevani <support@aevani.example>'
	}
}));
vi.mock('$env/dynamic/public', () => ({
	env: { PUBLIC_BASE_URL: 'https://aevani.example' }
}));
vi.mock('$lib/server/db', () => ({ db: {}, sqlClient: null }));

import { authHandoffHref, safeRedirectPath } from '$lib/auth/safeRedirect';
import { EmailService } from '$lib/server/services/email';
import InvitePage from '../../routes/invite/[token]/+page.svelte';
import RegisterPage from '../../routes/register/+page.svelte';
import VerifyEmailPage from '../../routes/verify-email/+page.svelte';
import { invitePath } from './urls';

const origin = 'https://aevani.com';
const token = 'C'.repeat(43);
const inviteUrl = invitePath(token);

describe('invite token handoff', () => {
	it('keeps /invite/<token> through register and the verification link', async () => {
		const landing = render(InvitePage, {
			props: {
				data: {
					visit: {
						kind: 'landing',
						role: 'seller',
						note: null,
						creatorName: 'Ada Admin',
						token
					},
					registerHref: authHandoffHref('register', inviteUrl, origin),
					loginHref: authHandoffHref('login', inviteUrl, origin),
					resendHref: `/resend-verification?redirect=${encodeURIComponent(inviteUrl)}`
				}
			} as never
		});
		const registerHref = landing.body.match(/href="([^"]*\/register[^"]*)"/)?.[1] ?? '';
		expect(registerHref).toBe(`/register?redirect=${encodeURIComponent(inviteUrl)}`);

		const redirect = new URL(registerHref, origin).searchParams.get('redirect');
		expect(safeRedirectPath(redirect, origin)).toBe(inviteUrl);

		const register = render(RegisterPage, {
			props: {
				form: null,
				data: { redirectTo: inviteUrl, invite: token }
			}
		});
		expect(register.body).toContain(`name="redirect" value="${inviteUrl}"`);
		expect(register.body).toContain(`name="invite" value="${token}"`);

		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));
		await EmailService.sendVerificationEmail('ada@example.com', 'D'.repeat(43), inviteUrl);
		const request = vi.mocked(fetch).mock.calls.at(-1)?.[1] as RequestInit;
		const body = String(request.body);
		expect(body).toContain(`redirect=${encodeURIComponent(inviteUrl)}`);
		expect(body).not.toContain('https://evil.com');

		const verified = render(VerifyEmailPage, {
			props: {
				data: { token: 'D'.repeat(43), redirectTo: inviteUrl },
				form: {
					success: true,
					redirectTo: inviteUrl,
					message: 'Email confirmation recorded.'
				}
			}
		});
		expect(verified.body).toContain(`href="${inviteUrl}"`);
		expect(verified.body).toContain('Continue');

		expect(authHandoffHref('register', 'https://evil.com/invite/' + token, origin)).toBe(
			'/register'
		);
		expect(safeRedirectPath('https://evil.com/invite/' + token, origin)).toBe('/account/profile');
	});
});
