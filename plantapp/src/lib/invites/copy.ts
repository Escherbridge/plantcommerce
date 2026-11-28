import type { InviteRole } from '$lib/auth/userRole';
import type { InviteDisplayStatus } from './status';
import { formatBoiseDay } from './dates';

/**
 * The public affiliate program is opening for invitees.
 * Footer, /affiliate, /affiliate/terms, and llms.txt stay on their current wording.
 * The flat seller fee is omitted: invite copy does not state a price.
 */
export const AFFILIATE_PROGRAM_OPEN_FOR_INVITEES = true;

export function roleLabel(role: InviteRole): string {
	switch (role) {
		case 'affiliate':
			return 'Affiliate';
		case 'seller':
			return 'Seller';
		case 'instructor':
			return 'Instructor';
	}
}

export function rolePhrase(role: InviteRole): string {
	switch (role) {
		case 'affiliate':
			return 'an affiliate';
		case 'seller':
			return 'a seller';
		case 'instructor':
			return 'an instructor';
	}
}

export function displayName(person: {
	firstName: string | null;
	lastName: string | null;
	username?: string | null;
}): string {
	const full = [person.firstName, person.lastName].filter(Boolean).join(' ').trim();
	if (full) return full;
	if (person.username) return person.username;
	return 'No name given';
}

export function greetingName(person: {
	firstName: string | null;
	lastName: string | null;
	username?: string | null;
}): string {
	const name = displayName(person);
	return name === 'No name given' ? 'there' : name;
}

export function listRowTitle(input: {
	label: string | null;
	role: InviteRole;
	createdAt: Date;
}): string {
	if (input.label) return input.label;
	return `${roleLabel(input.role)} invite, ${formatBoiseDay(input.createdAt)}`;
}

export function detailHeading(label: string | null, role: InviteRole): string {
	if (label) return `Invite: ${label}`;
	return `${roleLabel(role)} invite`;
}

export function detailSubtitle(input: {
	createdAt: Date;
	creatorName: string | null;
	status: InviteDisplayStatus;
	revokedAt: Date | null;
}): string {
	const created = formatBoiseDay(input.createdAt);
	const who = input.creatorName ? ` by ${input.creatorName}` : '';
	const lead = `Created ${created}${who}.`;
	switch (input.status) {
		case 'active':
			return `${lead} This link is active.`;
		case 'used_up':
			return `${lead} This link has reached its use limit.`;
		case 'expired':
			return `${lead} This link has expired.`;
		case 'revoked':
			return input.revokedAt
				? `${lead} This link was revoked on ${formatBoiseDay(input.revokedAt)}.`
				: `${lead} This link was revoked.`;
	}
}

export function createdPanelExtra(role: InviteRole): string {
	switch (role) {
		case 'affiliate':
			return 'Payouts are not set up yet, and this invite does not quote a referral share.';
		case 'seller':
			return 'Payouts are not set up yet.';
		case 'instructor':
			return 'Teaching tools are not part of this invite. This link only sets up their account.';
	}
}

export function roleMeaning(role: InviteRole): string {
	switch (role) {
		case 'affiliate':
			return 'Affiliates send shoppers to Aevani. Payouts are not set up yet, and this page does not quote a referral share. This invite lets you create an account and continue to the affiliate dashboard when that is available to you.';
		case 'seller':
			return 'Independent sellers list their plants and goods on Aevani. Payouts are not set up yet. This invite lets you create an account.';
		case 'instructor':
			return 'Instructors will teach through Aevani when that work is ready. This invite lets you create an account. Teaching tools are not part of this invite.';
	}
}

export const WHAT_HAPPENS_NEXT =
	"Create an account, or sign in if you already have one. We'll ask you to verify the email you use. After that you'll see a short status page with anything still left to do.";

export function landingHeading(role: InviteRole): string {
	return `You've been invited to join Aevani as ${rolePhrase(role)}.`;
}

export function landingTitle(role: InviteRole): string {
	return `Join Aevani as ${rolePhrase(role)} — Aevani`;
}

export function attribution(creatorName: string | null): string {
	return creatorName ? `${creatorName} sent you this link.` : 'Aevani sent you this link.';
}

export function noteHeading(creatorName: string | null): string {
	return creatorName ? `A note from ${creatorName}` : 'A note from Aevani';
}

export type InviteErrorKind = 'expired' | 'revoked' | 'used' | 'not_found';

export function errorCopy(kind: InviteErrorKind): { heading: string; body: string } {
	switch (kind) {
		case 'expired':
			return {
				heading: 'This invite has ended.',
				body: "The link is past its end date, so it can't be used. Ask the person who sent it for a new one."
			};
		case 'revoked':
			return {
				heading: 'This invite is no longer valid.',
				body: "This link was revoked, so it can't be used. Ask the person who sent it for a new one."
			};
		case 'used':
			return {
				heading: 'This invite has already been used.',
				body: 'This link has reached its use limit. Ask the person who sent it for a new one. If you already created an account with it, you can sign in as usual.'
			};
		case 'not_found':
			return {
				heading: "We couldn't find this invite.",
				body: 'The link may be mistyped. Check the address, or ask the person who sent it for a new one.'
			};
	}
}

export const WRONG_ACCOUNT_HEADING = 'This invite is for a different account.';

export function wrongAccountBody(email: string): string {
	return `You're signed in as ${email}. If this invite was meant for you, continue. If it was meant for someone else, sign out and open the link again.`;
}

export function verifyPanel(email: string): { heading: string; body: string } {
	return {
		heading: 'Verify your email to finish this invite',
		body: `Thanks. We have your account. Confirm the email we sent to ${email} before this invite can be finished. If you don't see it, wait a few minutes, then request a new link from the verification page.`
	};
}

export type ReviewState = 'pending' | 'approved' | 'declined';

export function reviewStatusLabel(state: ReviewState): string {
	switch (state) {
		case 'pending':
			return 'Pending';
		case 'approved':
			return 'Approved';
		case 'declined':
			return 'Declined';
	}
}

export function statusPanel(input: {
	role: InviteRole;
	state: ReviewState;
	email: string;
	sellerApplicationReceived: boolean;
	dashboardAvailable: boolean;
}): { heading: string; body: string; link?: { href: string; label: string } } {
	const phrase = roleLabel(input.role).toLowerCase();
	if (input.state === 'declined') {
		return {
			heading: "This invite wasn't approved",
			body: `A manager declined this invite, so you don't have the ${phrase} role. Your account is still here. If you think that's a mistake, ask the person who invited you.`
		};
	}
	if (input.state === 'pending') {
		return {
			heading: 'Waiting for approval',
			body: `Thanks for joining. A manager will look over your account and let you know when it's approved. We'll write to ${input.email}.`
		};
	}
	if (input.role === 'affiliate') {
		return {
			heading: 'Your affiliate account is ready',
			body: 'Thanks. Your account is set up as an affiliate. Payouts are not set up yet, and we will not quote a referral share here. You can continue to the affiliate dashboard when it is available to you.',
			link: input.dashboardAvailable
				? { href: '/affiliate/dashboard', label: 'Go to the affiliate dashboard' }
				: undefined
		};
	}
	if (input.role === 'seller') {
		if (input.sellerApplicationReceived) {
			return {
				heading: 'Your seller account is ready',
				body: `Thanks. Your account is set up as a seller, and we have your application. Payouts are not set up yet. We'll reply to ${input.email}.`
			};
		}
		return {
			heading: 'Your seller account is ready',
			body: `Thanks. Your account is set up as a seller. Payouts are not set up yet. You can tell us what you grow or make on the sell page, or wait for us to write to you at ${input.email}.`,
			link: { href: '/sell', label: 'Tell us what you grow or make' }
		};
	}
	return {
		heading: 'Your instructor account is ready',
		body: `Thanks. Your account is set up as an instructor. Teaching tools are not part of this invite. We'll follow up at ${input.email} when there is something for you to do.`
	};
}

export function nextStep(input: {
	emailVerified: boolean;
	state: ReviewState;
	role: InviteRole;
	roleRemoved: boolean;
	sellerApplicationReceived: boolean;
}): string {
	if (input.roleRemoved) {
		return 'The invited role was removed. They can still sign in as a regular account.';
	}
	if (!input.emailVerified) return 'Waiting to verify their email.';
	if (input.state === 'declined') {
		return 'This invite was declined. They can still sign in as a regular account.';
	}
	if (input.state === 'pending') {
		return 'Waiting for a manager to approve this account.';
	}
	if (input.role === 'affiliate') {
		return 'Approved. They can use the affiliate dashboard when it is available to them.';
	}
	if (input.role === 'seller') {
		return input.sellerApplicationReceived
			? 'Approved. Application received. Waiting for a reply from Aevani.'
			: "Approved. Hasn't finished telling us what they grow or make.";
	}
	return 'Approved as an instructor. Next steps for teaching are not set in this tool yet.';
}

export function unusedHelpMessage(role: InviteRole, url: string): string {
	return [
		`Here's an Aevani invite: ${url}`,
		'',
		`It lets you create an account as ${rolePhrase(role)}. Open the link, create an account or sign in, and verify the email you use. A manager will look over the account before the role is approved. Payouts aren't set up yet, so this is just the account.`
	].join('\n');
}

export function personHelpMessage(input: {
	name: string;
	email: string;
	url: string;
	emailVerified: boolean;
	state: ReviewState;
	role: InviteRole;
}): string {
	const name = input.name.trim() || 'there';
	if (!input.emailVerified) {
		return [
			`Hi ${name},`,
			'',
			`You're partway through your Aevani invite. Check ${input.email} for a verification message, or sign in and request a new one from the verification page. Your invite link is ${input.url}.`
		].join('\n');
	}
	if (input.state === 'declined') {
		return [
			`Hi ${name},`,
			'',
			`A manager declined this invite, so you don't have the ${roleLabel(input.role).toLowerCase()} role. Your account is still here. If you think that's a mistake, write back and we can look again.`,
			input.url
		].join('\n');
	}
	if (input.state === 'pending') {
		return [
			`Hi ${name},`,
			'',
			`Thanks for joining. A manager will look over your account and let you know when it's approved. We'll write to ${input.email}.`,
			input.url
		].join('\n');
	}
	return [
		`Hi ${name},`,
		'',
		`Your Aevani account is set up. We'll follow up at ${input.email} when there is a next step. Payouts aren't set up yet.`,
		input.url
	].join('\n');
}

export const COPY_LINK_OK = 'The invite link is on your clipboard.';
export const COPY_LINK_FAILED = "We couldn't copy the link. Select it and copy it yourself.";
export const COPY_HELP_OK = 'The help message is on your clipboard.';
export const REVOKE_STATUS = 'This invite was revoked. The link no longer works.';
export const REVOKE_DISABLED = 'This invite can no longer be used.';

export function resendOk(email: string): string {
	return `A new verification email was sent to ${email}.`;
}

export function resendFailed(email: string): string {
	return `We couldn't send a verification email to ${email}. Try again in a few minutes.`;
}

export function roleRemovedStatus(role: InviteRole, name: string): string {
	return `The ${roleLabel(role).toLowerCase()} role was removed from ${name}.`;
}

export function approvedStatus(role: InviteRole, name: string): string {
	return `You approved ${name}. They now have the ${roleLabel(role).toLowerCase()} role.`;
}

export function declinedStatus(role: InviteRole, name: string): string {
	return `You declined ${name}. They don't have the ${roleLabel(role).toLowerCase()} role. Their account is still there.`;
}

export const APPROVE_NEEDS_VERIFICATION =
	'They still need to verify their email before you can approve them.';

const PRICE_OR_RATE =
	/\d+(?:\.\d+)?\s*%|\$\s*\d|\bcommission\b|\bstreet\b|\bper lead\b|\bflat 8\b/i;

/** Invite copy may say payouts are not set up. It may not state a rate, price, or address. */
export function inviteCopyForbidden(text: string): string | null {
	const match = text.match(PRICE_OR_RATE);
	return match ? match[0] : null;
}
