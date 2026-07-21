import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';

type SchemaProbe = {
	userTable: string | null;
	sessionTable: string | null;
	productTable: string | null;
};

const noStoreHeaders = { 'cache-control': 'no-store' };

export const GET = async () => {
	try {
		const [probe] = await db.execute<SchemaProbe>(sql`
			SELECT
				to_regclass('public."user"')::text AS "userTable",
				to_regclass('public."session"')::text AS "sessionTable",
				to_regclass('public.product')::text AS "productTable"
		`);
		const schemaReady = Boolean(probe?.userTable && probe?.sessionTable && probe?.productTable);
		const statusRelease = env.AEVANI_RELEASE_MODE === 'status';
		const healthy = schemaReady || statusRelease;

		return json(
			{
				status: schemaReady ? 'ready' : statusRelease ? 'status_release' : 'not_ready',
				releaseMode: statusRelease ? 'status' : 'operational',
				database: { connected: true, schemaReady }
			},
			{ status: healthy ? 200 : 503, headers: noStoreHeaders }
		);
	} catch {
		return json(
			{
				status: 'unavailable',
				releaseMode: env.AEVANI_RELEASE_MODE === 'status' ? 'status' : 'operational',
				database: { connected: false, schemaReady: false }
			},
			{ status: 503, headers: noStoreHeaders }
		);
	}
};
