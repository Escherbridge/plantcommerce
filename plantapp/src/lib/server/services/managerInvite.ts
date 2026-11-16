import { timingSafeEqual } from 'node:crypto';
import { and, desc, eq, sql } from 'drizzle-orm';
import type { InviteRole } from '$lib/auth/userRole';
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
import { displayName } from '$lib/invites/copy';

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
