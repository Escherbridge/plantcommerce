import postgres from 'postgres';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * A database shaped like production before this stack: main's schema (drizzle-kit export of origin/main at the
 * stack base, fixtures/main-schema.sql), with or without the tables from the source-only affiliate artifacts
 * 0006 and 0007, which the startup applier never creates. Test-only.
 */
const fixture = readFileSync(
	join(dirname(fileURLToPath(import.meta.url)), '../fixtures/main-schema.sql'),
	'utf8'
);

/** Tables created only by source-only artifacts 0006 and 0007. The live store may not have them. */
export const OPTIONAL_AFFILIATE_TABLES = [
	'affiliate_attribution',
	'affiliate_attribution_click',
	'affiliate_click_dedupe',
	'affiliate_tier',
	'affiliate_terms_acceptance',
	'affiliate_payout',
	'affiliate_commission_ledger',
	'affiliate_commission_ledger_event'
];

export function databaseUrlFor(baseUrl: string, name: string): string {
	const url = new URL(baseUrl);
	url.pathname = `/${name}`;
	return url.toString();
}

export async function createPrestackDatabase(
	adminUrl: string,
	name: string,
	options: { withAffiliateLedgerTables: boolean }
): Promise<string> {
	const admin = postgres(adminUrl, { max: 1, onnotice: () => {} });
	await admin.unsafe(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
	await admin.unsafe(`CREATE DATABASE "${name}"`);
	await admin.end({ timeout: 2 });

	const url = databaseUrlFor(adminUrl, name);
	const sql = postgres(url, { max: 1, onnotice: () => {} });
	let skipped = 0;
	for (const statement of fixture.split(/;\s*\n\s*\n/)) {
		const text = statement.trim();
		if (!text) continue;
		try {
			await sql.unsafe(text);
		} catch {
			// One composite foreign key in the export has no matching unique constraint upstream; it is skipped.
			skipped += 1;
		}
	}
	if (skipped > 3) throw new Error(`Pre-stack fixture skipped ${skipped} statements`);
	if (!options.withAffiliateLedgerTables) {
		for (const table of OPTIONAL_AFFILIATE_TABLES) {
			await sql.unsafe(`DROP TABLE IF EXISTS "${table}" CASCADE`);
		}
	}
	// Rows the live store would already have.
	await sql`INSERT INTO "user" (id, username, email, password_hash, email_verified) VALUES ('u1','shopper','shopper@example.com','x', true)`;
	await sql`INSERT INTO "user" (id, username, email, password_hash, email_verified, role) VALUES ('admin','admin','admin@example.com','x', true, 'admin')`;
	await sql`INSERT INTO product_category (id, name, slug) VALUES (1, 'Plants', 'plants')`;
	await sql`INSERT INTO product (id, name, slug, sku, price, category_id) VALUES (1, 'Fern', 'fern', 'fern-1', '25.00', 1)`;
	await sql`INSERT INTO "order" (id, order_number, user_id, status, total_amount, subtotal_amount, customer_email)
		VALUES (1, 'A-1', 'u1', 'paid', '25.00', '25.00', 'shopper@example.com')`;
	await sql`INSERT INTO order_item (id, order_id, product_id, product_name, product_sku, quantity, unit_price, total_price)
		VALUES (1, 1, 1, 'Fern', 'fern-1', 1, '25.00', '25.00')`;
	await sql.end({ timeout: 2 });
	return url;
}

export async function dropDatabase(adminUrl: string, name: string): Promise<void> {
	const admin = postgres(adminUrl, { max: 1, onnotice: () => {} });
	await admin.unsafe(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
	await admin.end({ timeout: 2 });
}

export async function tableExists(sql: postgres.Sql, name: string): Promise<boolean> {
	const [row] = await sql`SELECT to_regclass(${`public.${name}`}) AS found`;
	return row.found !== null;
}
