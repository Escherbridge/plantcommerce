import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';

export class EmailConfigurationError extends Error {
	constructor(message: string) {
		super(message);
	}
}

type EmailMessage = {
	to: string;
	subject: string;
	text: string;
	html: string;
	idempotencyKey: string;
};

function configuredValue(value: string | undefined): string | null {
	if (!value || value.includes('replace') || value.includes('example.com')) {
		return null;
	}
	return value;
}

function emailBaseUrl(): URL {
	const rawBaseUrl = configuredValue(publicEnv.PUBLIC_BASE_URL);
	if (!rawBaseUrl) {
		throw new EmailConfigurationError('PUBLIC_BASE_URL must be configured before sending account email');
	}

	let baseUrl: URL;
	try {
		baseUrl = new URL(rawBaseUrl);
	} catch {
		throw new EmailConfigurationError('PUBLIC_BASE_URL must be an absolute URL');
	}

	if (baseUrl.protocol !== 'https:' && !(dev && baseUrl.protocol === 'http:')) {
		throw new EmailConfigurationError('PUBLIC_BASE_URL must use HTTPS outside local development');
	}

	return baseUrl;
}

function capabilityLink(pathname: string, token: string): string {
	const url = new URL(pathname, emailBaseUrl());
	url.searchParams.set('token', token);
	return url.toString();
}

function htmlEscape(value: string): string {
	return value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;'
		};
		return entities[character];
	});
}

function idempotencyKey(purpose: string, token: string): string {
	return `aevani:${purpose}:${encodeHexLowerCase(sha256(new TextEncoder().encode(token)))}`;
}

/** Production-capable account email delivery. See `src/lib/server/AGENTS.md`. */
export class EmailService {
	static isConfigured(): boolean {
		try {
			this.getSenderConfiguration();
			emailBaseUrl();
			return true;
		} catch {
			return false;
		}
	}

	private static getSenderConfiguration(): { apiKey: string; from: string } {
		const apiKey = configuredValue(env.RESEND_API_KEY);
		const from = configuredValue(env.EMAIL_FROM);
		if (!apiKey || !from) {
			throw new EmailConfigurationError('RESEND_API_KEY and EMAIL_FROM must be configured before sending account email');
		}
		return { apiKey, from };
	}

	private static async send(message: EmailMessage): Promise<void> {
		const { apiKey, from } = this.getSenderConfiguration();
		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
				'User-Agent': 'aevani-auth/1.0',
				'Idempotency-Key': message.idempotencyKey
			},
			body: JSON.stringify({
				from,
				to: [message.to],
				subject: message.subject,
				text: message.text,
				html: message.html
			})
		});

		if (!response.ok) {
			throw new Error(`Account email provider rejected the request (${response.status})`);
		}
	}

	static async sendVerificationEmail(email: string, token: string): Promise<void> {
		const link = capabilityLink('/verify-email', token);
		await this.send({
			to: email,
			subject: 'Verify your Aevani email address',
			text: `Verify your email address by opening this link: ${link}\n\nThis link expires in 48 hours.`,
			html: `<p>Verify your Aevani email address by opening <a href="${htmlEscape(link)}">this link</a>.</p><p>This link expires in 48 hours.</p>`,
			idempotencyKey: idempotencyKey('verify-email', token)
		});
	}

	static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
		const link = capabilityLink('/reset-password', token);
		await this.send({
			to: email,
			subject: 'Reset your Aevani password',
			text: `Reset your password by opening this link: ${link}\n\nThis link expires in 24 hours. If you did not request this, you can ignore this email.`,
			html: `<p>Reset your Aevani password by opening <a href="${htmlEscape(link)}">this link</a>.</p><p>This link expires in 24 hours. If you did not request it, you can ignore this email.</p>`,
			idempotencyKey: idempotencyKey('password-reset', token)
		});
	}

	static async sendNewEmailChangeProof(pendingEmail: string, token: string): Promise<void> {
		const link = capabilityLink('/verify-email', token);
		await this.send({
			to: pendingEmail,
			subject: 'Verify the new email for your Aevani account',
			text: `Open this link to prove control of the new email address: ${link}\n\nYour account recovery email will not change until the existing email address also confirms this request. This link expires in 48 hours.`,
			html: `<p>Open <a href="${htmlEscape(link)}">this link</a> to prove control of the new email address.</p><p>Your account recovery email will not change until the existing email address also confirms this request. This link expires in 48 hours.</p>`,
			idempotencyKey: idempotencyKey('email-change-new-proof', token)
		});
	}

	static async sendExistingEmailChangeConfirmation(
		previousEmail: string,
		pendingEmail: string,
		token: string
	): Promise<void> {
		const link = capabilityLink('/verify-email', token);
		await this.send({
			to: previousEmail,
			subject: 'Confirm your Aevani email change',
			text: `A request was made to change your Aevani account email to ${pendingEmail}. Confirm this request by opening: ${link}\n\nThe new address cannot become your recovery email until you confirm from this existing address. If this was not you, do not open the link; reset your password or contact support. This link expires in 48 hours.`,
			html: `<p>A request was made to change your Aevani account email to <strong>${htmlEscape(pendingEmail)}</strong>.</p><p>Confirm it by opening <a href="${htmlEscape(link)}">this link</a>. The new address cannot become your recovery email until you confirm from this existing address.</p><p>If this was not you, do not open the link; reset your password or contact support. This link expires in 48 hours.</p>`,
			idempotencyKey: idempotencyKey('email-change-existing-confirmation', token)
		});
	}
}

export default EmailService;
