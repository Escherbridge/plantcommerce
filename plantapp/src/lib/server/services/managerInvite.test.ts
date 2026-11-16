import { vi } from 'vitest';

vi.mock('$lib/server/db', () => ({
	db: {},
	sqlClient: null
}));

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isHttpError, isRedirect } from '@sveltejs/kit';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { appRouter } from '$lib/server/api/root';
import {
	createdPanelExtra,
	inviteCopyForbidden,
	roleMeaning,
	unusedHelpMessage
} from '$lib/invites/copy';
import { hashInviteToken } from '$lib/invites/token';
import { inviteAbsoluteUrl } from '$lib/invites/urls';
import { INVITE_ROLE_MISSING } from '$lib/invites/validation';
import type { InviteRepository, InviteListRecord } from './managerInvite';
import {
	createManagerInvite,
	inviteHashesMatch,
	InviteForbiddenError,
	listManagerInvites,
	revokeManagerInvite
} from './managerInvite';

const pageDir = dirname(fileURLToPath(import.meta.url));

function memoryRepo() {
	const rows: InviteListRecord[] = [];
	const repo: InviteRepository = {
		async insertInvite(row) {
			rows.push({
				...row,
				status: 'active',
				revokedAt: null,
				creatorName: 'Ada Admin',
				creatorEmail: 'ada@example.com',
				useCount: 0,
				useEmails: []
			});
		},
		async listInvites() {
			return rows;
		},
		async getInvite(id) {
			return rows.find((row) => row.id === id) ?? null;
		},
		async revokeInvite(id, now) {
			const row = rows.find((item) => item.id === id);
			if (!row) return false;
			row.status = 'revoked';
			row.revokedAt = now;
			return true;
		},
		async findByTokenHash(tokenHash) {
			return rows.find((row) => row.tokenHash === tokenHash) ?? null;
		},
		async findUse() {
			return null;
		},
		async insertUse() {
			return 'created';
		},
		async getUse() {
			return null;
		},
		async listUses() {
			return [];
		},
		async setUseStatus() {},
		async markRoleRemoved() {}
	};
	return { repo, rows };
}

const actor = { role: 'admin' as const };
const now = new Date('2026-11-16T18:00:00.000Z');

describe('manager invite create and list', () => {
	it('stores a hashed token and lists the invite as active at /invite/<token>', async () => {
		const { repo, rows } = memoryRepo();
		const created = await createManagerInvite({
			actor,
			actorId: 'admin-1',
			now,
			repo,
			form: {
				role: 'seller',
				label: 'Spring seed house outreach',
				expires: '',
				useLimit: '1',
				note: ''
			}
		});
		expect(created.ok).toBe(true);
		if (!created.ok) return;
		expect(rows).toHaveLength(1);
		expect(rows[0]?.tokenHash).toBe(hashInviteToken(rows[0]?.token ?? ''));
		expect(rows[0]?.tokenHash).not.toBe(rows[0]?.token);
		expect(inviteHashesMatch(rows[0]?.tokenHash ?? '', rows[0]?.token ?? '')).toBe(true);
		expect(inviteHashesMatch(rows[0]?.tokenHash ?? '', 'A'.repeat(43))).toBe(false);
		expect(created.invite.url).toBe(inviteAbsoluteUrl(rows[0]?.token ?? ''));
		expect(created.invite.url).toMatch(/^https:\/\/aevani\.com\/invite\/[A-Za-z0-9_-]{43}$/);
		expect(created.invite.url).not.toContain('/aff/');
		expect(created.invite.displayStatus).toBe('active');

		const listed = await listManagerInvites({ actor, now, repo });
		expect(listed.map((invite) => invite.id)).toContain(created.invite.id);
		expect(listed[0]?.displayStatus).toBe('active');

		await revokeManagerInvite({ actor, id: created.invite.id, now, repo });
		expect(rows).toHaveLength(1);
		expect(rows[0]?.status).toBe('revoked');
		const after = await listManagerInvites({ actor, now, repo });
		expect(after[0]?.displayStatus).toBe('revoked');
	});

	it('rejects a non-admin and a missing role', async () => {
		const { repo } = memoryRepo();
		await expect(
			createManagerInvite({
				actor: { role: 'customer' },
				actorId: 'person-1',
				now,
				repo,
				form: { role: 'seller', label: '', expires: '', useLimit: '', note: '' }
			})
		).rejects.toBeInstanceOf(InviteForbiddenError);

		const missing = await createManagerInvite({
			actor,
			actorId: 'admin-1',
			now,
			repo,
			form: { role: '', label: '', expires: '2020-01-01', useLimit: '0', note: '' }
		});
		expect(missing.ok).toBe(false);
		if (missing.ok) return;
		expect(missing.fieldErrors.map((error) => error.message)).toEqual([
			INVITE_ROLE_MISSING,
			'Pick a date in the future, or leave this blank.',
			'Enter a whole number of 1 or more, or leave this blank.'
		]);
		expect(repo).toBeTruthy();
	});

	it('gives a non-admin a forbidden response from the admin procedure', async () => {
		const caller = appRouter.createCaller({
			event: {
				url: new URL('https://aevani.com/admin/invites'),
				request: new Request('https://aevani.com/admin/invites'),
				getClientAddress: () => '203.0.113.10'
			} as never,
			user: { id: 'customer-1', role: 'customer' } as never,
			session: { id: 'session-1' } as never
		});
		await expect(caller.admin.createManagerInvite({ role: 'seller' })).rejects.toMatchObject({
			message: 'You must be an admin to access this resource'
		});
	});

	it('does not state a rate, a share amount, or a payout time', () => {
		const samples = [
			createdPanelExtra('affiliate'),
			createdPanelExtra('seller'),
			createdPanelExtra('instructor'),
			roleMeaning('affiliate'),
			roleMeaning('seller'),
			unusedHelpMessage('seller', 'https://aevani.com/invite/example')
		];
		for (const sample of samples) {
			expect(inviteCopyForbidden(sample)).toBeNull();
		}
		const page = readFileSync(join(pageDir, '../../../routes/admin/invites/+page.svelte'), 'utf8');
		expect(inviteCopyForbidden(page)).toBeNull();
		expect(page).toContain('min-width: 24px');
		expect(page).toContain('min-height: 24px');
		expect(page).toContain('id="invite-error-summary"');
		expect(page).toContain('role="status"');
		expect(page).toContain('aria-live="polite"');
		expect(page).not.toContain('/aff/');
	});
});

describe('admin invites page actions', () => {
	it('returns forbidden for a customer', async () => {
		const { actions } = await import('../../../routes/admin/invites/+page.server');
		const event = {
			request: new Request('https://aevani.com/admin/invites', { method: 'POST' }),
			locals: { user: { id: 'customer-1', role: 'customer' } }
		};
		try {
			await actions.default(event as never);
			expect.fail('expected forbidden');
		} catch (caught) {
			expect(isHttpError(caught)).toBe(true);
			if (isHttpError(caught)) expect(caught.status).toBe(403);
			expect(isRedirect(caught)).toBe(false);
		}
	});

	it('renders a created invite in the list', async () => {
		const { default: Page } = await import('../../../routes/admin/invites/+page.svelte');
		const token = 'A'.repeat(43);
		const rendered = render(Page, {
			props: {
				form: null,
				data: {
					roleQuery: 'seller',
					revokedNotice: false,
					created: {
						id: 'invite-1',
						token,
						tokenHash: hashInviteToken(token),
						role: 'seller',
						label: 'Spring seed house outreach',
						expiresAt: null,
						useLimit: 1,
						note: null,
						status: 'active',
						revokedAt: null,
						createdBy: 'admin-1',
						createdAt: now,
						creatorName: 'Ada Admin',
						creatorEmail: 'ada@example.com',
						useCount: 0,
						useEmails: [],
						displayStatus: 'active',
						url: inviteAbsoluteUrl(token)
					},
					invites: [
						{
							id: 'invite-1',
							token,
							tokenHash: hashInviteToken(token),
							role: 'seller',
							label: 'Spring seed house outreach',
							expiresAt: null,
							useLimit: 1,
							note: null,
							status: 'active',
							revokedAt: null,
							createdBy: 'admin-1',
							createdAt: now,
							creatorName: 'Ada Admin',
							creatorEmail: 'ada@example.com',
							useCount: 0,
							useEmails: [],
							displayStatus: 'active',
							url: inviteAbsoluteUrl(token)
						}
					]
				}
			} as never
		});
		expect(rendered.body).toContain('Spring seed house outreach');
		expect(rendered.body).toContain('Active');
		expect(rendered.body).toContain(inviteAbsoluteUrl(token));
		expect(rendered.body).toContain('Seller');
		expect(rendered.head).toContain('Invites — Aevani');
		expect(inviteCopyForbidden(rendered.body)).toBeNull();
	});
});
