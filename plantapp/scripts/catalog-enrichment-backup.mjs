import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL?.trim();
const outputPath = process.env.CATALOG_ENRICHMENT_BACKUP_PATH?.trim();
if (!databaseUrl || !outputPath) {
	throw new Error('DATABASE_URL and CATALOG_ENRICHMENT_BACKUP_PATH are required.');
}

const sourceTables = [
	'product_category',
	'product',
	'product_image',
	'file',
	'content_page',
	'catalog_seed_category',
	'catalog_seed_collection',
	'catalog_seed_item'
];
const sql = postgres(databaseUrl, { max: 1, connect_timeout: 15, prepare: false });
try {
	const snapshot = {
		databaseName: (await sql`SELECT current_database() AS name`)[0].name,
		createdAt: new Date().toISOString(),
		tables: {}
	};
	for (const table of sourceTables) {
		const exists = await sql`SELECT to_regclass(${'public.' + table}) IS NOT NULL AS exists`;
		if (!exists[0].exists) continue;
		snapshot.tables[table] = await sql.unsafe(
			`SELECT row_to_json(row) AS row FROM (SELECT * FROM public."${table}") AS row`
		);
	}
	const payload = JSON.stringify(snapshot, null, 2);
	await mkdir(dirname(outputPath), { recursive: true });
	await writeFile(outputPath, payload, 'utf8');
	console.log(
		JSON.stringify(
			{
				path: outputPath,
				sha256: createHash('sha256').update(payload).digest('hex'),
				tables: Object.fromEntries(
					Object.entries(snapshot.tables).map(([name, rows]) => [name, rows.length])
				)
			},
			null,
			2
		)
	);
} finally {
	await sql.end({ timeout: 5 });
}
