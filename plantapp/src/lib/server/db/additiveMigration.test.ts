import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { executableMigrationSql } from './additiveMigration';

const migrationPath = new URL('../../../../drizzle/0010_product_coming_soon.sql', import.meta.url);
const sellerMigrationPath = new URL(
	'../../../../drizzle/0011_seller_application.sql',
	import.meta.url
);
const transferGroupMigrationPath = new URL(
	'../../../../drizzle/0012_order_transfer_group.sql',
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

describe('order transfer group migration', () => {
	const source = readFileSync(transferGroupMigrationPath, 'utf8');
	const sql = executableMigrationSql(source);

	it('adds nullable charge columns and does not rewrite order rows', () => {
		expect(sql).toContain(
			'ALTER TABLE "public"."order" ADD COLUMN IF NOT EXISTS "stripe_charge_id" text'
		);
		expect(sql).toContain(
			'ALTER TABLE "public"."order" ADD COLUMN IF NOT EXISTS "transfer_group" text'
		);
		expect(sql).toContain('CREATE UNIQUE INDEX IF NOT EXISTS "order_stripe_charge_id_unique"');
		expect(sql).not.toMatch(/\b(DROP|DELETE|UPDATE|TRUNCATE|ALTER COLUMN)\b/i);
		expect(sql.replace(/\bIS NOT NULL\b/gi, '')).not.toMatch(/\bNOT NULL\b/i);
		expect(sql).not.toMatch(/\bBEGIN\b|\bCOMMIT\b/i);
	});
});
