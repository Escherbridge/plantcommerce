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
	"Your account is created. We couldn't send the verification email right now. You'll be able to verify once email is back. Try resending it later.";

/**
 * After registration, follow the return path only when the verification email went out.
 * Otherwise the return path is often the verify gate, which cannot be completed yet.
 */
export function postRegisterHref(verificationEmailSent: boolean, continuePath: string): string {
	if (!verificationEmailSent) return VERIFICATION_SHOP_PATH;
	return continuePath;
}
