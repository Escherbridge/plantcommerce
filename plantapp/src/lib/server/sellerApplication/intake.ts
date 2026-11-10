import { z } from 'zod';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, number[]>();

export const sellerApplicationSchema = z.object({
	name: z.string().trim().min(1, 'Enter your name.').max(120, 'Name is too long.'),
	email: z
		.string()
		.trim()
		.email('Enter a valid email address.')
		.max(320, 'Email is too long.')
		.transform((value) => value.toLowerCase()),
	businessName: z
		.string()
		.trim()
		.min(1, 'Enter your business or farm name.')
		.max(160, 'Business name is too long.'),
	websiteOrSocial: z
		.string()
		.trim()
		.max(300, 'Website or social link is too long.')
		.transform((value) => value || null),
	offerings: z
		.string()
		.trim()
		.min(1, 'Tell us what you grow or make.')
		.max(2000, 'That description is too long.'),
	location: z.string().trim().min(1, 'Enter your location.').max(160, 'Location is too long.'),
	message: z.string().trim().min(1, 'Add a short message.').max(4000, 'Message is too long.')
});

export type SellerApplicationInput = z.infer<typeof sellerApplicationSchema>;

export function sellerApplicationFieldErrors(error: z.ZodError): Record<string, string> {
	const fieldErrors: Record<string, string> = {};
	for (const issue of error.issues) {
		const key = String(issue.path[0] ?? 'form');
		if (!fieldErrors[key]) fieldErrors[key] = issue.message;
	}
	return fieldErrors;
}

/** Five submissions per subject per hour. The subject should already be a hash, not a raw address. */
export function allowSellerApplication(subject: string, now = Date.now()): boolean {
	const recent = (attempts.get(subject) ?? []).filter((at) => now - at < WINDOW_MS);
	if (recent.length >= MAX_ATTEMPTS) {
		attempts.set(subject, recent);
		return false;
	}
	recent.push(now);
	attempts.set(subject, recent);
	return true;
}

export function resetSellerApplicationLimits(): void {
	attempts.clear();
}
