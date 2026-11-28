import type { InviteRole } from '$lib/auth/userRole';
import { isInviteRole } from '$lib/auth/userRole';
import { boiseCalendarDate, endOfBoiseDay } from './dates';

export const INVITE_LABEL_MAX = 120;
export const INVITE_NOTE_MAX = 1000;

export type InviteField = 'role' | 'label' | 'expires' | 'useLimit' | 'note';

export type InviteFieldError = {
	field: InviteField;
	message: string;
};

export type InviteDraft = {
	role: InviteRole;
	label: string | null;
	expiresAt: Date | null;
	useLimit: number | null;
	note: string | null;
};

export const INVITE_ERROR_SUMMARY_HEADING =
	"Your invite didn't go through. Fix these and create it again:";

export const INVITE_ROLE_MISSING = 'Choose a role for this invite.';
export const INVITE_EXPIRY_PAST = 'Pick a date in the future, or leave this blank.';
export const INVITE_USE_LIMIT_INVALID = 'Enter a whole number of 1 or more, or leave this blank.';
export const INVITE_LABEL_TOO_LONG = `Keep the label to ${INVITE_LABEL_MAX} characters or fewer.`;
export const INVITE_NOTE_TOO_LONG = `Keep the note to ${INVITE_NOTE_MAX} characters or fewer.`;
export const INVITE_TRANSPORT_ERROR = "We couldn't create the invite. Wait a moment and try again.";

export type InviteFormInput = {
	role: string;
	label: string;
	expires: string;
	useLimit: string;
	note: string;
};

export function validateInviteDraft(
	input: InviteFormInput,
	now: Date
): { ok: true; draft: InviteDraft } | { ok: false; fieldErrors: InviteFieldError[] } {
	const fieldErrors: InviteFieldError[] = [];
	let role: InviteRole | null = null;
	if (!isInviteRole(input.role)) {
		fieldErrors.push({ field: 'role', message: INVITE_ROLE_MISSING });
	} else {
		role = input.role;
	}

	const label = input.label.trim();
	if (label.length > INVITE_LABEL_MAX) {
		fieldErrors.push({ field: 'label', message: INVITE_LABEL_TOO_LONG });
	}

	let expiresAt: Date | null = null;
	const expires = input.expires.trim();
	if (expires) {
		const end = endOfBoiseDay(expires);
		if (!end || expires < boiseCalendarDate(now)) {
			fieldErrors.push({ field: 'expires', message: INVITE_EXPIRY_PAST });
		} else {
			expiresAt = end;
		}
	}

	let useLimit: number | null = null;
	const rawLimit = input.useLimit.trim();
	if (rawLimit) {
		if (!/^\d+$/.test(rawLimit)) {
			fieldErrors.push({ field: 'useLimit', message: INVITE_USE_LIMIT_INVALID });
		} else {
			const parsed = Number(rawLimit);
			if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 2147483647) {
				fieldErrors.push({ field: 'useLimit', message: INVITE_USE_LIMIT_INVALID });
			} else {
				useLimit = parsed;
			}
		}
	}

	const note = input.note.trim();
	if (note.length > INVITE_NOTE_MAX) {
		fieldErrors.push({ field: 'note', message: INVITE_NOTE_TOO_LONG });
	}

	if (fieldErrors.length > 0 || !role) return { ok: false, fieldErrors };
	return {
		ok: true,
		draft: {
			role,
			label: label || null,
			expiresAt,
			useLimit,
			note: note || null
		}
	};
}
