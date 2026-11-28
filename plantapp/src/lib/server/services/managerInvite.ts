import { timingSafeEqual } from 'node:crypto';
import { and, count, desc, eq, sql, type SQL } from 'drizzle-orm';
import type { InviteRole, UserRole } from '$lib/auth/userRole';
import { db } from '$lib/server/db';
import {
	affiliate,
	managerInvite,
	managerInviteUse,
	sellerApplication,
	user
} from '$lib/server/db/schema';
import { isActiveApprovedAffiliate } from '$lib/server/services/affiliate';
import {
	describeInviteVisit,
	type TokenVisit,
	type Viewer,
	type ViewerUse
} from '$lib/invites/view';
import { displayStatus, type InviteDisplayStatus } from '$lib/invites/status';
import { generateInviteToken, hashInviteToken, isInviteToken } from '$lib/invites/token';
import { inviteAbsoluteUrl } from '$lib/invites/urls';
import {
	validateInviteDraft,
	type InviteDraft,
	type InviteFieldError,
	type InviteFormInput
} from '$lib/invites/validation';
import { displayName, type ReviewState } from '$lib/invites/copy';
import { invitePath } from '$lib/invites/urls';
import { accountCapabilitiesEnabled, generateEmailVerificationToken } from '$lib/server/auth';
import { EmailService } from '$lib/server/services/email';
import { UserService } from '$lib/server/services/user';

export class InviteForbiddenError extends Error {
	constructor() {
		super('Forbidden');
		this.name = 'InviteForbiddenError';
	}
}

export type InviteListRecord = {
	id: string;
	token: string;
	tokenHash: string;
	role: InviteRole;
	label: string | null;
	expiresAt: Date | null;
	useLimit: number | null;
	note: string | null;
	status: 'active' | 'revoked';
	revokedAt: Date | null;
	createdBy: string;
	createdAt: Date;
	creatorName: string | null;
	creatorEmail: string;
	useCount: number;
	useEmails: string[];
};

export type InviteRepository = {
	insertInvite(row: {
		id: string;
		tokenHash: string;
		token: string;
		role: InviteRole;
		label: string | null;
		expiresAt: Date | null;
		useLimit: number | null;
		note: string | null;
		createdBy: string;
		createdAt: Date;
	}): Promise<void>;
	listInvites(): Promise<InviteListRecord[]>;
	getInvite(id: string): Promise<InviteListRecord | null>;
	revokeInvite(id: string, now: Date): Promise<boolean>;
	findByTokenHash(tokenHash: string): Promise<InviteListRecord | null>;
	findUse(inviteId: string, userId: string): Promise<ViewerUse | null>;
	insertUse(row: {
		id: string;
		inviteId: string;
		userId: string;
		createdAt: Date;
	}): Promise<'created' | 'exists' | 'full'>;
	getUse(useId: string): Promise<InviteUseRecord | null>;
	listUses(inviteId: string): Promise<InviteUseRecord[]>;
	/** Conditional pending -> status update. False when another reviewer got there first. */
	claimUseReview(
		useId: string,
		status: ReviewState,
		reviewerId: string,
		now: Date
	): Promise<boolean>;
	reopenUse(useId: string): Promise<void>;
	markRoleRemoved(useId: string, now: Date): Promise<void>;
};

export type InviteUseRecord = {
	id: string;
	inviteId: string;
	inviteRole: InviteRole;
	userId: string;
	status: ReviewState;
	roleRemovedAt: Date | null;
	createdAt: Date;
	email: string;
	username: string;
	firstName: string | null;
	lastName: string | null;
	emailVerified: boolean;
	userRole: UserRole;
	sellerApplicationReceived: boolean;
	dashboardAvailable: boolean;
};

export function inviteHashesMatch(storedHex: string, presentedToken: string): boolean {
	const computed = hashInviteToken(presentedToken);
	const stored = Buffer.from(storedHex, 'hex');
	const next = Buffer.from(computed, 'hex');
	if (stored.length === 0 || stored.length !== next.length) return false;
	return timingSafeEqual(stored, next);
}

export function assertInviteAdmin(user: { role: string } | null | undefined): void {
	if (!user || user.role !== 'admin') throw new InviteForbiddenError();
}

function newId(): string {
	return crypto.randomUUID();
}

export function toDisplayedInvite(record: InviteListRecord, now: Date) {
	const status: InviteDisplayStatus = displayStatus(record, record.useCount, now);
	return {
		...record,
		displayStatus: status,
		url: inviteAbsoluteUrl(record.token)
	};
}

async function listInviteUses(where: SQL): Promise<InviteUseRecord[]> {
	const rows = await db
		.select({
			id: managerInviteUse.id,
			inviteId: managerInviteUse.inviteId,
			inviteRole: managerInvite.role,
			userId: managerInviteUse.userId,
			status: managerInviteUse.status,
			roleRemovedAt: managerInviteUse.roleRemovedAt,
			createdAt: managerInviteUse.createdAt,
			email: user.email,
			username: user.username,
			firstName: user.firstName,
			lastName: user.lastName,
			emailVerified: user.emailVerified,
			userRole: user.role
		})
		.from(managerInviteUse)
		.innerJoin(managerInvite, eq(managerInviteUse.inviteId, managerInvite.id))
		.innerJoin(user, eq(managerInviteUse.userId, user.id))
		.where(where);
	const uses: InviteUseRecord[] = [];
	for (const row of rows) {
		const [application] = await db
			.select({ id: sellerApplication.id })
			.from(sellerApplication)
			.where(sql`lower(${sellerApplication.email}) = ${row.email.toLowerCase()}`)
			.limit(1);
		const [membership] = await db
			.select({ status: affiliate.status, isActive: affiliate.isActive })
			.from(affiliate)
			.where(eq(affiliate.userId, row.userId))
			.limit(1);
		uses.push({
			...row,
			sellerApplicationReceived: Boolean(application),
			dashboardAvailable: membership ? isActiveApprovedAffiliate(membership) : false
		});
	}
	return uses;
}

const drizzleRepository: InviteRepository = {
	async insertInvite(row) {
		await db.insert(managerInvite).values({
			...row,
			status: 'active'
		});
	},
	async listInvites() {
		const rows = await db
			.select({
				id: managerInvite.id,
				token: managerInvite.token,
				tokenHash: managerInvite.tokenHash,
				role: managerInvite.role,
				label: managerInvite.label,
				expiresAt: managerInvite.expiresAt,
				useLimit: managerInvite.useLimit,
				note: managerInvite.note,
				status: managerInvite.status,
				revokedAt: managerInvite.revokedAt,
				createdBy: managerInvite.createdBy,
				createdAt: managerInvite.createdAt,
				creatorFirst: user.firstName,
				creatorLast: user.lastName,
				creatorUsername: user.username,
				creatorEmail: user.email
			})
			.from(managerInvite)
			.innerJoin(user, eq(managerInvite.createdBy, user.id))
			.orderBy(desc(managerInvite.createdAt));

		const uses = await db
			.select({
				inviteId: managerInviteUse.inviteId,
				email: user.email
			})
			.from(managerInviteUse)
			.innerJoin(user, eq(managerInviteUse.userId, user.id));

		const emailsByInvite = new Map<string, string[]>();
		for (const use of uses) {
			const list = emailsByInvite.get(use.inviteId) ?? [];
			list.push(use.email);
			emailsByInvite.set(use.inviteId, list);
		}

		return rows.map((row) => {
			const useEmails = emailsByInvite.get(row.id) ?? [];
			return {
				id: row.id,
				token: row.token,
				tokenHash: row.tokenHash,
				role: row.role,
				label: row.label,
				expiresAt: row.expiresAt,
				useLimit: row.useLimit,
				note: row.note,
				status: row.status,
				revokedAt: row.revokedAt,
				createdBy: row.createdBy,
				createdAt: row.createdAt,
				creatorName: displayName({
					firstName: row.creatorFirst,
					lastName: row.creatorLast,
					username: row.creatorUsername
				}),
				creatorEmail: row.creatorEmail,
				useCount: useEmails.length,
				useEmails
			};
		});
	},
	async getInvite(id) {
		const invites = await this.listInvites();
		return invites.find((invite) => invite.id === id) ?? null;
	},
	async revokeInvite(id, now) {
		const updated = await db
			.update(managerInvite)
			.set({ status: 'revoked', revokedAt: now })
			.where(eq(managerInvite.id, id))
			.returning({ id: managerInvite.id, status: managerInvite.status });
		if (updated.length === 0) return false;
		return true;
	},
	async findByTokenHash(tokenHash) {
		const invites = await this.listInvites();
		return invites.find((invite) => invite.tokenHash === tokenHash) ?? null;
	},
	async findUse(inviteId, userId) {
		const [row] = await db
			.select({
				status: managerInviteUse.status,
				roleRemovedAt: managerInviteUse.roleRemovedAt,
				email: user.email
			})
			.from(managerInviteUse)
			.innerJoin(user, eq(managerInviteUse.userId, user.id))
			.where(and(eq(managerInviteUse.inviteId, inviteId), eq(managerInviteUse.userId, userId)))
			.limit(1);
		if (!row) return null;
		const [application] = await db
			.select({ id: sellerApplication.id })
			.from(sellerApplication)
			.where(sql`lower(${sellerApplication.email}) = ${row.email.toLowerCase()}`)
			.limit(1);
		const [membership] = await db
			.select({ status: affiliate.status, isActive: affiliate.isActive })
			.from(affiliate)
			.where(eq(affiliate.userId, userId))
			.limit(1);
		return {
			status: row.status,
			roleRemovedAt: row.roleRemovedAt,
			sellerApplicationReceived: Boolean(application),
			dashboardAvailable: membership ? isActiveApprovedAffiliate(membership) : false
		};
	},
	async insertUse(row) {
		// Row lock on the invite serializes concurrent uses, so the limit cannot be passed by a race.
		return db.transaction(async (tx) => {
			const [invite] = await tx
				.select({ useLimit: managerInvite.useLimit })
				.from(managerInvite)
				.where(eq(managerInvite.id, row.inviteId))
				.for('update');
			if (!invite) return 'full' as const;
			const [already] = await tx
				.select({ id: managerInviteUse.id })
				.from(managerInviteUse)
				.where(
					and(eq(managerInviteUse.inviteId, row.inviteId), eq(managerInviteUse.userId, row.userId))
				)
				.limit(1);
			if (already) return 'exists' as const;
			if (invite.useLimit !== null) {
				const [{ used }] = await tx
					.select({ used: count() })
					.from(managerInviteUse)
					.where(eq(managerInviteUse.inviteId, row.inviteId));
				if (used >= invite.useLimit) return 'full' as const;
			}
			await tx.insert(managerInviteUse).values({
				id: row.id,
				inviteId: row.inviteId,
				userId: row.userId,
				status: 'pending',
				createdAt: row.createdAt
			});
			return 'created' as const;
		});
	},
	async getUse(useId) {
		const uses = await listInviteUses(eq(managerInviteUse.id, useId));
		return uses[0] ?? null;
	},
	async listUses(inviteId) {
		return listInviteUses(eq(managerInviteUse.inviteId, inviteId));
	},
	async claimUseReview(useId, status, reviewerId, now) {
		const claimed = await db
			.update(managerInviteUse)
			.set({ status, reviewedBy: reviewerId, reviewedAt: now })
			.where(and(eq(managerInviteUse.id, useId), eq(managerInviteUse.status, 'pending')))
			.returning({ id: managerInviteUse.id });
		return claimed.length > 0;
	},
	async reopenUse(useId) {
		await db
			.update(managerInviteUse)
			.set({ status: 'pending', reviewedBy: null, reviewedAt: null })
			.where(eq(managerInviteUse.id, useId));
	},
	async markRoleRemoved(useId, now) {
		await db
			.update(managerInviteUse)
			.set({ roleRemovedAt: now })
			.where(eq(managerInviteUse.id, useId));
	}
};

export type CreateInviteResult =
	| { ok: true; invite: ReturnType<typeof toDisplayedInvite> }
	| { ok: false; fieldErrors: InviteFieldError[] };

export async function createManagerInvite(input: {
	actor: { role: string } | null;
	actorId: string;
	form: InviteFormInput;
	now?: Date;
	repo?: InviteRepository;
	token?: string;
}): Promise<CreateInviteResult> {
	assertInviteAdmin(input.actor);
	const now = input.now ?? new Date();
	const parsed = validateInviteDraft(input.form, now);
	if (!parsed.ok) return parsed;
	const repo = input.repo ?? drizzleRepository;
	const token = input.token ?? generateInviteToken();
	const id = newId();
	await repo.insertInvite({
		id,
		token,
		tokenHash: hashInviteToken(token),
		role: parsed.draft.role,
		label: parsed.draft.label,
		expiresAt: parsed.draft.expiresAt,
		useLimit: parsed.draft.useLimit,
		note: parsed.draft.note,
		createdBy: input.actorId,
		createdAt: now
	});
	const invite = await repo.getInvite(id);
	if (!invite) {
		return {
			ok: true,
			invite: toDisplayedInvite(recordFromDraft(id, token, parsed.draft, input.actorId, now), now)
		};
	}
	return { ok: true, invite: toDisplayedInvite(invite, now) };
}

function recordFromDraft(
	id: string,
	token: string,
	draft: InviteDraft,
	actorId: string,
	now: Date
): InviteListRecord {
	return {
		id,
		token,
		tokenHash: hashInviteToken(token),
		role: draft.role,
		label: draft.label,
		expiresAt: draft.expiresAt,
		useLimit: draft.useLimit,
		note: draft.note,
		status: 'active',
		revokedAt: null,
		createdBy: actorId,
		createdAt: now,
		creatorName: null,
		creatorEmail: '',
		useCount: 0,
		useEmails: []
	};
}

export async function listManagerInvites(input: {
	actor: { role: string } | null;
	now?: Date;
	repo?: InviteRepository;
}) {
	assertInviteAdmin(input.actor);
	const repo = input.repo ?? drizzleRepository;
	const now = input.now ?? new Date();
	const rows = await repo.listInvites();
	return rows.map((row) => toDisplayedInvite(row, now));
}

export async function revokeManagerInvite(input: {
	actor: { role: string } | null;
	id: string;
	now?: Date;
	repo?: InviteRepository;
}): Promise<{ ok: true } | { ok: false; reason: 'missing' }> {
	assertInviteAdmin(input.actor);
	const repo = input.repo ?? drizzleRepository;
	const now = input.now ?? new Date();
	const existing = await repo.getInvite(input.id);
	if (!existing) return { ok: false, reason: 'missing' };
	if (displayStatus(existing, existing.useCount, now) !== 'active') {
		return { ok: true };
	}
	await repo.revokeInvite(input.id, now);
	return { ok: true };
}

export function lookupHashForToken(token: string): string | null {
	if (!isInviteToken(token)) return null;
	return hashInviteToken(token);
}

export async function resolveInviteVisit(input: {
	token: string;
	viewer: Viewer | null;
	now?: Date;
	repo?: InviteRepository;
}): Promise<TokenVisit> {
	const now = input.now ?? new Date();
	const repo = input.repo ?? drizzleRepository;
	const tokenHash = lookupHashForToken(input.token);
	if (!tokenHash) return { kind: 'not_found' };
	const invite = await repo.findByTokenHash(tokenHash);
	if (!invite || !inviteHashesMatch(invite.tokenHash, input.token)) return { kind: 'not_found' };
	const viewerUse = input.viewer ? await repo.findUse(invite.id, input.viewer.id) : null;
	return describeInviteVisit({
		invite,
		viewer: input.viewer,
		viewerUse,
		now
	});
}

/** Record a pending use. The role stays unchanged until a manager approves it. */
export async function recordInviteUse(input: {
	token: string;
	viewer: Viewer;
	now?: Date;
	repo?: InviteRepository;
}): Promise<TokenVisit> {
	const now = input.now ?? new Date();
	const repo = input.repo ?? drizzleRepository;
	const before = await resolveInviteVisit({
		token: input.token,
		viewer: input.viewer,
		now,
		repo
	});
	if (before.kind !== 'wrong_account' && before.kind !== 'landing') return before;
	const tokenHash = lookupHashForToken(input.token);
	const invite = tokenHash ? await repo.findByTokenHash(tokenHash) : null;
	if (!invite || !inviteHashesMatch(invite.tokenHash, input.token)) return { kind: 'not_found' };
	await repo.insertUse({
		id: crypto.randomUUID(),
		inviteId: invite.id,
		userId: input.viewer.id,
		createdAt: now
	});
	return resolveInviteVisit({
		token: input.token,
		viewer: input.viewer,
		now,
		repo
	});
}

type RoleUpdater = (userId: string, role: UserRole) => Promise<void>;

function defaultRoleUpdate(userId: string, role: UserRole): Promise<void> {
	return UserService.updateUserRole(userId, role);
}

export async function reviewInviteUse(input: {
	actor: { id: string; role: string };
	useId: string;
	decision: 'approved' | 'declined';
	now?: Date;
	repo?: InviteRepository;
	setRole?: RoleUpdater;
}): Promise<
	| { ok: true; name: string; role: InviteRole }
	| { ok: false; reason: ReviewRefusal; message: string }
> {
	assertInviteAdmin(input.actor);
	const repo = input.repo ?? drizzleRepository;
	const use = await repo.getUse(input.useId);
	if (!use) return refuse('missing');
	const now = input.now ?? new Date();
	if (use.status !== 'pending') return refuse('not_pending');
	if (input.decision === 'approved') {
		const invite = await repo.getInvite(use.inviteId);
		if (!invite || invite.status !== 'active') return refuse('invite_inactive');
		// A use can only exist from before the expiry; this guards a row that somehow post-dates it.
		if (invite.expiresAt && use.createdAt.getTime() > invite.expiresAt.getTime()) {
			return refuse('invite_expired');
		}
		if (!use.emailVerified) return refuse('unverified');
		// The account has one role. Never overwrite anything but the base role, or the role already granted.
		if (!use.roleRemovedAt && use.userRole !== 'customer' && use.userRole !== use.inviteRole) {
			return refuse('role_conflict', use.userRole);
		}
	}
	// Winner-takes-it: only one reviewer moves a use out of pending.
	const claimed = await repo.claimUseReview(use.id, input.decision, input.actor.id, now);
	if (!claimed) return refuse('not_pending');
	if (input.decision === 'approved' && !use.roleRemovedAt && use.userRole !== use.inviteRole) {
		try {
			await (input.setRole ?? defaultRoleUpdate)(use.userId, use.inviteRole);
		} catch (error) {
			await repo.reopenUse(use.id);
			throw error;
		}
	}
	return {
		ok: true,
		name: displayName(use),
		role: use.inviteRole
	};
}

export type ReviewRefusal =
	| 'missing'
	| 'not_pending'
	| 'invite_inactive'
	| 'invite_expired'
	| 'unverified'
	| 'role_conflict';

function refuse(reason: ReviewRefusal, currentRole?: string) {
	const messages: Record<ReviewRefusal, string> = {
		missing: "We couldn't find that person.",
		not_pending: 'This request was already reviewed.',
		invite_inactive: 'This invite was revoked, so it cannot be approved.',
		invite_expired: 'This invite had expired, so it cannot be approved.',
		unverified: 'Their email is not verified yet.',
		role_conflict: `This account already has the ${currentRole} role. Remove that role first; an account holds one role.`
	};
	return { ok: false as const, reason, message: messages[reason] };
}

export async function removeInvitedRole(input: {
	actor: { id: string; role: string };
	useId: string;
	now?: Date;
	repo?: InviteRepository;
	setRole?: RoleUpdater;
}): Promise<{ ok: true; name: string; role: InviteRole } | { ok: false }> {
	assertInviteAdmin(input.actor);
	const repo = input.repo ?? drizzleRepository;
	const use = await repo.getUse(input.useId);
	if (!use) return { ok: false };
	if (use.userRole === 'admin' && input.actor.id === use.userId) {
		throw new InviteForbiddenError();
	}
	if (use.userRole === 'admin') throw new InviteForbiddenError();
	const now = input.now ?? new Date();
	if (!use.roleRemovedAt && use.userRole === use.inviteRole) {
		await (input.setRole ?? defaultRoleUpdate)(use.userId, 'customer');
	}
	await repo.markRoleRemoved(use.id, now);
	return { ok: true, name: displayName(use), role: use.inviteRole };
}

export async function resendInviteVerification(input: {
	actor: { id: string; role: string };
	useId: string;
	repo?: InviteRepository;
	send?: (email: string, returnPath: string) => Promise<boolean>;
}): Promise<{ ok: true; email: string } | { ok: false; email?: string }> {
	assertInviteAdmin(input.actor);
	const repo = input.repo ?? drizzleRepository;
	const use = await repo.getUse(input.useId);
	if (!use || use.emailVerified) return { ok: false, email: use?.email };
	const invite = await repo.getInvite(use.inviteId);
	if (!invite) return { ok: false, email: use.email };
	const send = input.send ?? sendVerificationEmail;
	const sent = await send(use.email, invitePath(invite.token));
	return sent ? { ok: true, email: use.email } : { ok: false, email: use.email };
}

export async function getManagerInvite(input: {
	actor: { role: string } | null;
	id: string;
	now?: Date;
	repo?: InviteRepository;
}) {
	assertInviteAdmin(input.actor);
	const repo = input.repo ?? drizzleRepository;
	const now = input.now ?? new Date();
	const invite = await repo.getInvite(input.id);
	if (!invite) return null;
	const uses = await repo.listUses(invite.id);
	return { invite: toDisplayedInvite(invite, now), uses };
}

export async function listWaitingApprovals(input: {
	actor: { role: string } | null;
	repo?: InviteRepository;
}) {
	assertInviteAdmin(input.actor);
	const repo = input.repo ?? drizzleRepository;
	const invites = await repo.listInvites();
	const people = [];
	for (const invite of invites) {
		const uses = await repo.listUses(invite.id);
		for (const use of uses) {
			people.push({
				...use,
				inviteLabel: invite.label,
				inviteCreatedAt: invite.createdAt
			});
		}
	}
	return people;
}

async function sendVerificationEmail(email: string, returnPath: string): Promise<boolean> {
	if (!accountCapabilitiesEnabled() || !EmailService.isConfigured()) return false;
	const account = await UserService.getUserByEmail(email);
	if (!account) return false;
	const token = await generateEmailVerificationToken(account.id, account.email);
	if (!token) return false;
	await EmailService.sendVerificationEmail(account.email, token, returnPath);
	return true;
}
