import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/db', () => ({ db: {}, sqlClient: null }));

import { inviteCopyForbidden, personHelpMessage, unusedHelpMessage } from '$lib/invites/copy';
import { hashInviteToken } from '$lib/invites/token';
import { inviteAbsoluteUrl } from '$lib/invites/urls';
import DetailPage from '../../../routes/admin/invites/[id]/+page.svelte';
import {
	InviteForbiddenError,
	removeInvitedRole,
	resendInviteVerification,
	reviewInviteUse,
	revokeManagerInvite,
	type InviteListRecord,
	type InviteRepository,
	type InviteUseRecord
} from './managerInvite';

const now = new Date('2026-11-16T18:00:00.000Z');
const token = 'E'.repeat(43);

function harness(role: InviteUseRecord['userRole'] = 'customer', userId = 'ada') {
	const invite: InviteListRecord = {
		id: 'invite-1',
		token,
		tokenHash: hashInviteToken(token),
		role: 'seller',
		label: 'Spring seed house outreach',
		expiresAt: null,
		useLimit: null,
		note: 'Bring a cutting.',
		status: 'active',
		revokedAt: null,
		createdBy: 'admin-1',
		createdAt: now,
		creatorName: 'Ada Admin',
		creatorEmail: 'admin@example.com',
		useCount: 1,
		useEmails: ['ada@example.com']
	};
	const use: InviteUseRecord = {
		id: 'use-1',
		inviteId: invite.id,
		inviteRole: 'seller',
		userId,
		status: 'pending',
		roleRemovedAt: null,
		createdAt: now,
		email: 'ada@example.com',
		username: 'ada',
		firstName: 'Ada',
		lastName: 'Grower',
		emailVerified: false,
		userRole: role,
		sellerApplicationReceived: false,
		dashboardAvailable: false
	};
	const roles: string[] = [];
	const repo: InviteRepository = {
		async insertInvite() {},
		async listInvites() {
			return [invite];
		},
		async getInvite(id) {
			return id === invite.id ? invite : null;
		},
		async revokeInvite(id, when) {
			if (id !== invite.id) return false;
			invite.status = 'revoked';
			invite.revokedAt = when;
			return true;
		},
		async findByTokenHash() {
			return invite;
		},
		async findUse() {
			return null;
		},
		async insertUse() {
			return 'created';
		},
		async getUse(id) {
			return id === use.id ? use : null;
		},
		async listUses() {
			return [use];
		},
		async setUseStatus(_id, status) {
			use.status = status;
		},
		async markRoleRemoved(_id, when) {
			use.roleRemovedAt = when;
		}
	};
	return {
		invite,
		use,
		repo,
		roles,
		setRole: async (_userId: string, next: string) => {
			roles.push(next);
			use.userRole = next as InviteUseRecord['userRole'];
		}
	};
}

const actor = { id: 'admin-1', role: 'admin' };

describe('invite detail actions', () => {
	it('approves the seller role, rejects without granting it, and keeps history on revoke', async () => {
		const { repo, use, roles, setRole, invite } = harness();
		const approved = await reviewInviteUse({
			actor,
			useId: use.id,
			decision: 'approved',
			now,
			repo,
			setRole
		});
		expect(approved).toMatchObject({ ok: true, role: 'seller' });
		expect(roles).toEqual(['seller']);
		expect(use.status).toBe('approved');

		const rejected = harness();
		await reviewInviteUse({
			actor,
			useId: rejected.use.id,
			decision: 'rejected',
			now,
			repo: rejected.repo,
			setRole: rejected.setRole
		});
		expect(rejected.roles).toEqual([]);
		expect(rejected.use.status).toBe('rejected');

		await revokeManagerInvite({ actor, id: invite.id, now, repo });
		expect(invite.status).toBe('revoked');
		expect(await repo.listUses(invite.id)).toHaveLength(1);
	});

	it('removes a granted role and forbids an admin removing their own admin role', async () => {
		const { repo, use, roles, setRole } = harness('seller');
		use.status = 'approved';
		const removed = await removeInvitedRole({ actor, useId: use.id, now, repo, setRole });
		expect(removed.ok).toBe(true);
		expect(roles).toEqual(['customer']);
		expect(use.roleRemovedAt).toEqual(now);

		const own = harness('admin', 'admin-1');
		await expect(
			removeInvitedRole({
				actor,
				useId: own.use.id,
				now,
				repo: own.repo,
				setRole: own.setRole
			})
		).rejects.toBeInstanceOf(InviteForbiddenError);
		expect(own.roles).toEqual([]);
		expect(own.use.roleRemovedAt).toBeNull();
	});

	it('resends verification with the invite return path and copies help without a rate', async () => {
		const { repo, use, invite } = harness();
		const sent: string[] = [];
		const result = await resendInviteVerification({
			actor,
			useId: use.id,
			repo,
			send: async (email, returnPath) => {
				sent.push(`${email} ${returnPath}`);
				return true;
			}
		});
		expect(result).toEqual({ ok: true, email: 'ada@example.com' });
		expect(sent).toEqual([`ada@example.com /invite/${token}`]);
		const url = inviteAbsoluteUrl(token);
		const linkHelp = unusedHelpMessage('seller', url);
		const personHelp = personHelpMessage({
			name: 'Ada Grower',
			email: use.email,
			url,
			emailVerified: false,
			state: 'pending',
			role: 'seller'
		});
		expect(inviteCopyForbidden(linkHelp)).toBeNull();
		expect(inviteCopyForbidden(personHelp)).toBeNull();
		expect(linkHelp).toContain(url);

		const page = readFileSync(
			join(
				dirname(fileURLToPath(import.meta.url)),
				'../../../routes/admin/invites/[id]/+page.svelte'
			),
			'utf8'
		);
		expect(page).toContain('min-width: 24px');
		expect(page).toContain('min-height: 24px');
		expect(page).toContain('id="invite-error-summary"');
		expect(page).toContain('role="status"');
		expect(page).toContain('aria-live="polite"');
		expect(page).not.toMatch(/stripe|setAffiliateStatus/i);

		const rendered = render(DetailPage, {
			props: {
				form: null,
				data: {
					detail: {
						invite: { ...invite, displayStatus: 'active', url },
						uses: [use]
					},
					notice: null,
					noticeName: '',
					noticeEmail: '',
					noticeRole: ''
				}
			} as never
		});
		expect(rendered.body).toContain('Waiting to verify their email.');
		expect(rendered.body).toContain('Resend verification');
		expect(rendered.body).toContain('Approve Ada Grower');
		expect(inviteCopyForbidden(rendered.body)).toBeNull();
	});
});
