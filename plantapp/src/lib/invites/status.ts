export type InviteRecordStatus = 'active' | 'revoked';
export type InviteDisplayStatus = 'active' | 'used_up' | 'expired' | 'revoked';

export function displayStatus(
	invite: {
		status: InviteRecordStatus;
		revokedAt: Date | null;
		expiresAt: Date | null;
		useLimit: number | null;
	},
	useCount: number,
	now: Date
): InviteDisplayStatus {
	if (invite.status === 'revoked' || invite.revokedAt) return 'revoked';
	if (invite.expiresAt && invite.expiresAt.getTime() <= now.getTime()) return 'expired';
	if (invite.useLimit != null && useCount >= invite.useLimit) return 'used_up';
	return 'active';
}

export function statusLabel(status: InviteDisplayStatus): string {
	switch (status) {
		case 'active':
			return 'Active';
		case 'used_up':
			return 'Used up';
		case 'expired':
			return 'Expired';
		case 'revoked':
			return 'Revoked';
	}
}

export function usesLabel(count: number, limit: number | null): string {
	if (limit == null) return count === 1 ? '1 time' : `${count} times`;
	if (count === 1) return `1 of ${limit} times`;
	return `${count} of ${limit} times`;
}

export function canStillRevoke(status: InviteDisplayStatus): boolean {
	return status === 'active';
}
