import 'dotenv/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

if (
	(!process.env.DATABASE_URL || process.env.DATABASE_URL.length === 0) &&
	(process.env.DATABASE_FULL !== 'true' ||
		!process.env.DATABASE_FULL_URL ||
		process.env.DATABASE_FULL_URL.length === 0)
) {
	throw new Error('DATABASE_URL or DATABASE_FULL_URL must be set');
}

const client = new Database(
	process.env.DATABASE_FULL === 'true' ? process.env.DATABASE_FULL_URL! : process.env.DATABASE_URL!
);
export const db = drizzle(client, { schema });
