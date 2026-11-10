import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { executableMigrationSql } from './additiveMigration';

const migrationPath = new URL('../../../../drizzle/0010_product_coming_soon.sql', import.meta.url);

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
