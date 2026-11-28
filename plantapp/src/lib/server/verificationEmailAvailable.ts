import { accountCapabilitiesEnabled } from '$lib/server/auth';
import { EmailService } from '$lib/server/services/email';

/**
 * Whether a verification email can be sent right now.
 * Read-only signal for page copy. It does not send mail or change auth behavior.
 */
export function verificationEmailAvailable(): boolean {
	return accountCapabilitiesEnabled() && EmailService.isConfigured();
}
