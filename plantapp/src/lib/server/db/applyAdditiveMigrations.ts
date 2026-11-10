import { sqlClient } from '$lib/server/db';
import comingSoonSql from '../../../../drizzle/0010_product_coming_soon.sql?raw';
import sellerApplicationSql from '../../../../drizzle/0011_seller_application.sql?raw';
import { executableMigrationSql } from './additiveMigration';

const migrations = [comingSoonSql, sellerApplicationSql];

let pending: Promise<void> | null = null;

/**
 * Apply the additive seller-recruiting DDL once per process.
 * Railway starts `node build/index.js` and does not run drizzle-kit.
 * The first request awaits this before any route query.
 */
export function ensureAdditiveMigrations(): Promise<void> {
	if (!pending) {
		pending = apply().catch((error) => {
			pending = null;
			throw error;
		});
	}
	return pending;
}

async function apply(): Promise<void> {
	const statements = migrations.map(executableMigrationSql).filter((sql) => sql.length > 0);
	if (statements.length === 0 || !sqlClient) return;

	await sqlClient.begin(async (tx) => {
		for (const statement of statements) {
			await tx.unsafe(statement);
		}
	});
}
