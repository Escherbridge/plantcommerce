import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inviteRoles, userRoles } from '$lib/auth/userRole';
import { executableMigrationSql } from './additiveMigration';

const migrationPath = new URL('../../../../drizzle/0010_product_coming_soon.sql', import.meta.url);
const sellerMigrationPath = new URL(
	'../../../../drizzle/0011_seller_application.sql',
	import.meta.url
);

describe('coming soon migration', () => {
	const source = readFileSync(migrationPath, 'utf8');
	const sql = executableMigrationSql(source);

	it('adds a nullable column and does not rewrite product rows', () => {
		expect(sql).toContain(
			'ALTER TABLE "public"."product" ADD COLUMN IF NOT EXISTS "coming_soon" boolean'
		);
		expect(sql).not.toMatch(/\b(DROP|DELETE|UPDATE|TRUNCATE|ALTER COLUMN)\b/i);
		expect(sql).not.toMatch(/\bNOT NULL\b/i);
		expect(sql).not.toMatch(/\bBEGIN\b|\bCOMMIT\b/i);
	});
});

describe('seller application migration', () => {
	const source = readFileSync(sellerMigrationPath, 'utf8');
	const sql = executableMigrationSql(source);

	it('creates one additive table and does not rewrite existing data', () => {
		expect(sql).toContain('CREATE TABLE IF NOT EXISTS "public"."seller_application"');
		expect(sql).toContain('CREATE INDEX IF NOT EXISTS "seller_application_email_idx"');
		expect(sql).not.toMatch(/\b(DROP|DELETE|UPDATE|TRUNCATE)\b/i);
		expect(sql).not.toMatch(/\bBEGIN\b|\bCOMMIT\b/i);
	});
});

describe('manager invite migration', () => {
	const migrationPath = new URL('../../../../drizzle/0012_manager_invites.sql', import.meta.url);
	const source = readFileSync(migrationPath, 'utf8');
	const sql = executableMigrationSql(source);
	const schemaSource = readFileSync(new URL('./schema.ts', import.meta.url), 'utf8');

	it('creates only the two invite tables and does not rewrite existing rows', () => {
		expect(sql).toContain('CREATE TABLE IF NOT EXISTS "public"."manager_invite"');
		expect(sql).toContain('CREATE TABLE IF NOT EXISTS "public"."manager_invite_use"');
		expect(sql.match(/CREATE TABLE/g)).toHaveLength(2);
		expect(sql).toContain('"status" text DEFAULT \'pending\' NOT NULL');
		expect(sql).not.toMatch(/\b(DROP|DELETE|UPDATE|TRUNCATE|ALTER TABLE)\b/i);
		expect(sql).not.toMatch(/\bBEGIN\b|\bCOMMIT\b/i);
		expect(sql).not.toMatch(/seller_application|"affiliate"/i);
		expect(sql).not.toMatch(/\b(payout|stripe|commission|earnings|connect)\b/i);
	});

	it('adds seller to the application role list without a user-table rewrite', () => {
		expect(userRoles).toContain('seller');
		expect(inviteRoles).toEqual(['affiliate', 'seller', 'instructor']);
		expect(schemaSource).toContain('enum: userRoles');
		expect(schemaSource).not.toMatch(/ALTER TABLE/);
		expect(sql).not.toMatch(/ALTER TABLE\s+"public"\."user"/i);
		expect(source).toMatch(/does not ALTER "user"/);
	});
});
