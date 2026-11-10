import { building } from '$app/environment';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as lmsSchema from './lms-schema';
import * as lmsRelations from './lms-relations';
import { env } from '$env/dynamic/private';

const databaseUrl = env.DATABASE_URL;
if (!databaseUrl && !building) {
	throw new Error('DATABASE_URL is not set');
}

export const sqlClient = postgres(databaseUrl ?? 'postgres://127.0.0.1:5432/aevani_build');

export const db = drizzle(sqlClient, { schema: { ...schema, ...lmsSchema, ...lmsRelations } });
