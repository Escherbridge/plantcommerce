import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Real-Postgres invite flows. Skipped unless FLOW_TEST_DATABASE_URL points at a throwaway database holding the
// schema (see plantapp/src/lib/server/AGENTS.md, "Flow tests").
const databaseUrl = process.env.FLOW_TEST_DATABASE_URL;

vi.mock('$lib/server/db', async () => {
	const url = process.env.FLOW_TEST_DATABASE_URL;
	if (!url) return { db: {}, sqlClient: null };
	const { default: postgres } = await import('postgres');
	const { drizzle } = await import('drizzle-orm/postgres-js');
	const schema = await import('$lib/server/db/schema');
	const sqlClient = postgres(url, { max: 10, onnotice: () => {} });
	return { sqlClient, db: drizzle(sqlClient, { schema }) };
});

const token = 'F'.repeat(43);

describe.skipIf(!databaseUrl)('manager invite flows on Postgres', { timeout: 30_000 }, () => {
	let sql: Awaited<typeof import('$lib/server/db')>['sqlClient'];
	let invites: typeof import('./managerInvite');

	beforeEach(async () => {
		vi.resetModules();
		sql = (await import('$lib/server/db')).sqlClient;
		invites = await import('./managerInvite');
		const { hashInviteToken } = await import('$lib/invites/token');
		await sql.unsafe(`TRUNCATE manager_invite_use, manager_invite, "user" CASCADE`);
		for (const id of ['admin', 'u1', 'u2', 'u3']) {
			await sql`INSERT INTO "user" (id, username, email, password_hash, email_verified)
				VALUES (${id}, ${id}, ${id + '@example.com'}, 'x', true)`;
		}
		await sql`INSERT INTO manager_invite (id, token_hash, token, role, use_limit, status, created_by)
			VALUES ('inv1', ${hashInviteToken(token)}, ${token}, 'seller', 1, 'active', 'admin')`;
	});

	afterAll(async () => {
		await sql?.end({ timeout: 2 });
	});

	const viewer = (id: string) => ({ id, email: `${id}@example.com`, emailVerified: true });

	it('a use limit of one admits exactly one of two concurrent users', async () => {
		await Promise.all([
			invites.recordInviteUse({ token, viewer: viewer('u1') }),
			invites.recordInviteUse({ token, viewer: viewer('u2') })
		]);
		const [{ count }] = await sql`SELECT count(*)::int AS count FROM manager_invite_use`;
		expect(count).toBe(1);
	});

	it('concurrent approve and decline: one wins, and the role follows only an approval', async () => {
		await sql`INSERT INTO manager_invite_use (id, invite_id, user_id) VALUES ('use1','inv1','u1')`;
		const actor = { id: 'admin', role: 'admin' };
		const [approve, decline] = await Promise.all([
			invites.reviewInviteUse({ actor, useId: 'use1', decision: 'approved' }),
			invites.reviewInviteUse({ actor, useId: 'use1', decision: 'declined' })
		]);
		expect([approve.ok, decline.ok].filter(Boolean)).toHaveLength(1);
		const [use] = await sql`SELECT status FROM manager_invite_use WHERE id = 'use1'`;
		const [account] = await sql`SELECT role FROM "user" WHERE id = 'u1'`;
		expect(account.role).toBe(use.status === 'approved' ? 'seller' : 'customer');
	});

	it('does not overwrite an instructor role on approval', async () => {
		await sql`UPDATE "user" SET role = 'instructor' WHERE id = 'u1'`;
		await sql`INSERT INTO manager_invite_use (id, invite_id, user_id) VALUES ('use1','inv1','u1')`;
		const result = await invites.reviewInviteUse({
			actor: { id: 'admin', role: 'admin' },
			useId: 'use1',
			decision: 'approved'
		});
		expect(result).toMatchObject({ ok: false, reason: 'role_conflict' });
		const [account] = await sql`SELECT role FROM "user" WHERE id = 'u1'`;
		expect(account.role).toBe('instructor');
	});
});
