import { vi } from 'vitest';

vi.mock('$lib/server/db', () => ({
	db: {},
	sqlClient: null
}));

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from '$lib/auth/safeRedirect';
import { errorCopy } from './copy';
import { hashInviteToken } from './token';
import { describeInviteVisit, type VisitInvite, type Viewer } from './view';
import InvitePage from '../../routes/invite/[token]/+page.svelte';
import {
	inviteHashesMatch,
	resolveInviteVisit,
	type InviteListRecord,
	type InviteRepository
} from '../server/services/managerInvite';

const now = new Date('2026-11-16T18:00:00.000Z');
const token = 'B'.repeat(43);
const viewer: Viewer = {
	id: 'person-1',
	email: 'ada@example.com',
	emailVerified: true
};

function invite(overrides: Partial<VisitInvite> = {}): VisitInvite {
	return {
		role: 'affiliate',
		label: null,
		note: null,
		creatorName: 'Ada Admin',
		status: 'active',
		revokedAt: null,
		expiresAt: null,
		useLimit: 1,
		useCount: 0,
		token,
		...overrides
	};
}

function record(): InviteListRecord {
	return {
		id: 'invite-1',
		token,
		tokenHash: hashInviteToken(token),
		role: 'seller',
		label: null,
		expiresAt: null,
		useLimit: 1,
		note: null,
		status: 'active',
		revokedAt: null,
		createdBy: 'admin-1',
		createdAt: now,
		creatorName: 'Ada Admin',
		creatorEmail: 'admin@example.com',
		useCount: 0,
		useEmails: []
	};
}

const states = [
	['expired', { expiresAt: new Date('2026-11-01T00:00:00.000Z') }, 'This invite has ended.'],
	['revoked', { status: 'revoked' as const, revokedAt: now }, 'This invite is no longer valid.'],
	['used', { useCount: 1, useLimit: 1 }, 'This invite has already been used.'],
	['not_found', null, "We couldn't find this invite."]
] as const;

describe('invite token pages', () => {
	it('gives each closed token state its own heading', () => {
		for (const [kind, patch, heading] of states) {
			const visit =
				kind === 'not_found'
					? describeInviteVisit({ invite: null, viewer: null, viewerUse: null, now })
					: describeInviteVisit({
							invite: invite(patch ?? {}),
							viewer: null,
							viewerUse: null,
							now
						});
			expect(visit.kind).toBe(kind === 'used' ? 'used' : kind);
			if (
				visit.kind === 'expired' ||
				visit.kind === 'revoked' ||
				visit.kind === 'used' ||
				visit.kind === 'not_found'
			) {
				expect(errorCopy(visit.kind).heading).toBe(heading);
			}
			const rendered = render(InvitePage, {
				props: {
					data: {
						visit,
						registerHref: '/register',
						loginHref: '/login',
						resendHref: '/resend-verification'
					}
				} as never
			});
			expect(rendered.body).toContain(heading);
			expect(rendered.body).not.toContain("You've been invited");
			expect(rendered.head).toContain('noindex');
		}
	});

	it('shows the signed-in choice instead of assigning a role', () => {
		const visit = describeInviteVisit({
			invite: invite(),
			viewer,
			viewerUse: null,
			now
		});
		expect(visit.kind).toBe('wrong_account');
		const rendered = render(InvitePage, {
			props: {
				data: {
					visit,
					registerHref: '/register?redirect=%2Finvite%2Ftoken',
					loginHref: '/login?redirect=%2Finvite%2Ftoken',
					resendHref: '/resend-verification'
				}
			} as never
		});
		expect(rendered.body).toContain('This invite is for a different account.');
		expect(rendered.body).toContain('Continue as ada@example.com');
		expect(rendered.body).toContain('Sign out');
		expect(rendered.body).not.toContain('Your affiliate account is ready');
	});

	it('rejects a foreign absolute redirect and does not treat a product code as an invite', async () => {
		expect(safeRedirectPath('https://evil.com/invite/' + token, 'https://aevani.com')).toBe(
			'/account/profile'
		);
		const lookedUp: string[] = [];
		const repo: InviteRepository = {
			async insertInvite() {},
			async listInvites() {
				return [];
			},
			async getInvite() {
				return null;
			},
			async revokeInvite() {
				return false;
			},
			async findByTokenHash(hash) {
				lookedUp.push(hash);
				return record();
			},
			async findUse() {
				return null;
			}
		};
		const productCode = 'spring-kit';
		const missed = await resolveInviteVisit({
			token: productCode,
			viewer: null,
			now,
			repo
		});
		expect(missed.kind).toBe('not_found');
		expect(lookedUp).toEqual([]);
		const found = await resolveInviteVisit({ token, viewer: null, now, repo });
		expect(found.kind).toBe('landing');
		expect(lookedUp).toEqual([hashInviteToken(token)]);
		expect(inviteHashesMatch(hashInviteToken(token), token)).toBe(true);

		const aff = readFileSync(
			join(dirname(fileURLToPath(import.meta.url)), '../../routes/aff/[linkCode]/+page.server.ts'),
			'utf8'
		);
		expect(aff).not.toContain('managerInvite');
		expect(aff).not.toContain('resolveInviteVisit');
	});
});
