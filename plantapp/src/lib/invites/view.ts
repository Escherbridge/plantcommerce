import type { InviteRole } from '$lib/auth/userRole';
import { displayStatus, type InviteDisplayStatus } from './status';
import type { ReviewState } from './copy';

export type Viewer = {
	id: string;
	email: string;
	emailVerified: boolean;
};

export type ViewerUse = {
	status: ReviewState;
	roleRemovedAt: Date | null;
	sellerApplicationReceived: boolean;
	dashboardAvailable: boolean;
};

export type VisitInvite = {
	role: InviteRole;
	label: string | null;
	note: string | null;
	creatorName: string | null;
	status: 'active' | 'revoked';
	revokedAt: Date | null;
	expiresAt: Date | null;
	useLimit: number | null;
	useCount: number;
	token: string;
};

export type TokenVisit =
	| { kind: 'not_found' }
	| { kind: 'expired' | 'revoked' | 'used'; displayStatus: InviteDisplayStatus }
	| {
			kind: 'landing';
			role: InviteRole;
			note: string | null;
			creatorName: string | null;
			token: string;
	  }
	| { kind: 'wrong_account'; email: string; token: string; role: InviteRole }
	| {
			kind: 'verify' | 'status';
			role: InviteRole;
			token: string;
			email: string;
			emailVerified: boolean;
			state: ReviewState;
			roleRemoved: boolean;
			sellerApplicationReceived: boolean;
			dashboardAvailable: boolean;
	  };

export function describeInviteVisit(input: {
	invite: VisitInvite | null;
	viewer: Viewer | null;
	viewerUse: ViewerUse | null;
	now: Date;
}): TokenVisit {
	const invite = input.invite;
	if (!invite) return { kind: 'not_found' };
	if (input.viewer && input.viewerUse) {
		const shared = {
			role: invite.role,
			token: invite.token,
			email: input.viewer.email,
			emailVerified: input.viewer.emailVerified,
			state: input.viewerUse.status,
			roleRemoved: input.viewerUse.roleRemovedAt != null,
			sellerApplicationReceived: input.viewerUse.sellerApplicationReceived,
			dashboardAvailable: input.viewerUse.dashboardAvailable
		};
		return input.viewer.emailVerified
			? { kind: 'status', ...shared }
			: { kind: 'verify', ...shared };
	}
	const status = displayStatus(invite, invite.useCount, input.now);
	if (status === 'revoked') return { kind: 'revoked', displayStatus: status };
	if (status === 'expired') return { kind: 'expired', displayStatus: status };
	if (status === 'used_up') return { kind: 'used', displayStatus: status };
	if (!input.viewer) {
		return {
			kind: 'landing',
			role: invite.role,
			note: invite.note,
			creatorName: invite.creatorName,
			token: invite.token
		};
	}
	return {
		kind: 'wrong_account',
		email: input.viewer.email,
		token: invite.token,
		role: invite.role
	};
}
