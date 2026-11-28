import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inviteRoles, userRoles } from '$lib/auth/userRole';
import { executableMigrationSql } from './additiveMigration';

const migrationPath = new URL('../../../../drizzle/0010_product_coming_soon.sql', import.meta.url);
const sellerMigrationPath = new URL(
	'../../../../drizzle/0011_seller_application.sql',
	import.meta.url
);
const transferGroupMigrationPath = new URL(
	'../../../../drizzle/0013_order_transfer_group.sql',
	import.meta.url
);
const sellerPayoutMigrationPath = new URL(
	'../../../../drizzle/0014_seller_payout_account.sql',
	import.meta.url
);
const payoutStatusMigrationPath = new URL(
	'../../../../drizzle/0015_payout_account_status.sql',
	import.meta.url
);
const sellerEarningMigrationPath = new URL(
	'../../../../drizzle/0016_seller_earning.sql',
	import.meta.url
);

describe('coming soon migration', () => {
	const source = readFileSync(migrationPath, 'utf8');
	const sql = executableMigrationSql(source);

	it('adds a nullable column and does not rewrite product rows', () => {
		// Added only when missing, so later boots take no table lock.
		expect(sql).toContain('ALTER TABLE "public"."product" ADD COLUMN "coming_soon" boolean');
		expect(sql).toContain("column_name = 'coming_soon'");
		expect(sql).not.toMatch(/\b(DROP|DELETE|UPDATE|TRUNCATE|ALTER COLUMN)\b/i);
		expect(sql).not.toMatch(/\bNOT NULL\b/i);
		// No transaction wrapper (BEGIN; / COMMIT;); the DO block's own BEGIN is PL/pgSQL.
		expect(sql).not.toMatch(/\bBEGIN\s*;|\bCOMMIT\s*;/i);
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

describe('order transfer group migration', () => {
	const source = readFileSync(transferGroupMigrationPath, 'utf8');
	const sql = executableMigrationSql(source);

	it('adds nullable charge columns only when missing and does not rewrite order rows', () => {
		expect(sql).toContain('ALTER TABLE "public"."order" ADD COLUMN "stripe_charge_id" text');
		expect(sql).toContain('ALTER TABLE "public"."order" ADD COLUMN "transfer_group" text');
		expect(sql).toContain("column_name = 'stripe_charge_id'");
		expect(sql).toContain('CREATE UNIQUE INDEX "order_stripe_charge_id_unique"');
		expect(sql).toContain("to_regclass('public.order_stripe_charge_id_unique') IS NULL");
		expect(sql).not.toMatch(/(DROP|DELETE|UPDATE|TRUNCATE|ALTER COLUMN)/i);
		expect(sql.replace(/IS NOT NULL/gi, '')).not.toMatch(/NOT NULL/i);
		expect(sql).not.toMatch(/BEGIN\s*;|COMMIT\s*;/i);
	});
});

describe('seller and payout account migration', () => {
	const source = readFileSync(sellerPayoutMigrationPath, 'utf8');
	const sql = executableMigrationSql(source);

	it('adds seller ownership and a Connect record without rewriting rows', () => {
		expect(sql).toContain('CREATE TABLE IF NOT EXISTS "public"."seller"');
		expect(sql).toContain('CREATE TABLE IF NOT EXISTS "public"."payout_account"');
		expect(sql).toContain('ALTER TABLE "public"."product" ADD COLUMN "seller_id" integer');
		expect(sql).toContain('ALTER TABLE "public"."order_item" ADD COLUMN "seller_id" integer');
		// checkout_draft_item is optional (source-only artifact 0003): guarded by an existence check.
		expect(sql).toContain("to_regclass('public.checkout_draft_item') IS NOT NULL");
		expect(sql).not.toMatch(/\b(DROP|DELETE|UPDATE|TRUNCATE)\b/i);
		expect(sql).not.toMatch(/\b(bank|ssn|ein|tax_id|address)\b/i);
		expect(sql).not.toMatch(/^\s*BEGIN\s*;|^\s*COMMIT\s*;/im);
	});
});

describe('payout account status migration', () => {
	const source = readFileSync(payoutStatusMigrationPath, 'utf8');
	const sql = executableMigrationSql(source);

	it('adds nullable status columns and does not rewrite rows', () => {
		expect(sql).toContain('ADD COLUMN IF NOT EXISTS "last_payout_status" text');
		expect(sql).toContain('ADD COLUMN IF NOT EXISTS "external_account_updated_at"');
		expect(sql).not.toMatch(/\b(DROP|DELETE|UPDATE|TRUNCATE)\b/i);
		expect(sql).not.toMatch(/\bNOT NULL\b/i);
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

describe('seller earning migration', () => {
	const source = readFileSync(sellerEarningMigrationPath, 'utf8');
	const sql = executableMigrationSql(source);

	it('adds the ledger and delivery timestamps without rewriting rows', () => {
		expect(sql).toContain('CREATE TABLE IF NOT EXISTS "public"."seller_earning"');
		// Added only when missing, so later boots take no lock on "order".
		expect(sql).toContain(
			'ALTER TABLE "public"."order" ADD COLUMN "delivered_at" timestamp with time zone'
		);
		expect(sql).toContain("column_name = 'delivered_at'");
		expect(sql).toContain('"fee_bps" = 800');
		expect(sql).not.toMatch(/\b(DROP|DELETE|UPDATE|TRUNCATE)\b/i);
		expect(sql).not.toMatch(/^\s*BEGIN\s*;|^\s*COMMIT\s*;/im);
	});
});
