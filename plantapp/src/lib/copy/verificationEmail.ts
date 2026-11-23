import { pathWithRedirect } from '$lib/auth/safeRedirect';

/** Shop path. It does not require a verified email. */
export const VERIFICATION_SHOP_PATH = '/products' as const;

/** Account path. It does not require a verified email. */
export const VERIFICATION_ACCOUNT_PATH = '/account/profile' as const;

/** Existing public contact page. No new address is introduced here. */
export const VERIFICATION_CONTACT_PATH = '/contact' as const;

/**
 * Shown when the account exists but the verification email could not be sent.
 * Plain copy only: no rate, share, or payout timing.
 */
export const verificationEmailUnavailableCopy =
	"Your account is ready, but we couldn't send the verification email. You can resend it from the verification page later.";

/**
 * /resend-verification only. Signup and /affiliate/join keep
 * `verificationEmailUnavailableCopy`.
 */
export const verificationResendPageCopy =
	"Your account is ready, but we couldn't send the verification email.";

/** Returned by the resend API when delivery is unavailable. */
export const verificationEmailResendUnavailableMessage =
	"We couldn't send the verification email. Try again later.";

/** Shown when the resend request fails before the API answers. */
export const verificationResendTransportError =
	"That didn't send. Check your connection and try again.";

/** Document title while the register success state is on screen. */
export const accountCreatedDocumentTitle = 'Account created — Aevani';

/**
 * After registration, follow the return path only when the verification email went out.
 * Otherwise the return path is often the verify gate, which cannot be completed yet.
 */
export function postRegisterHref(verificationEmailSent: boolean, continuePath: string): string {
	if (!verificationEmailSent) return VERIFICATION_SHOP_PATH;
	return continuePath;
}

/** Success-screen resend link. Keeps a same-origin `redirect` and drops anything else. */
export function verificationResendHref(
	redirectTo: string | null | undefined,
	origin: string
): string {
	return pathWithRedirect('/resend-verification', redirectTo, origin);
}
