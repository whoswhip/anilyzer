import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import fs from 'fs';
import 'dotenv/config';

export function createIndexes() {
	const dbPath = process.env.DATABASE_URL || './series.sqlite';

	if (!dbPath || !fs.existsSync(dbPath)) {
		console.warn('Database file not found, skipping index creation');
		return;
	}

	try {
		const db = drizzle(new Database(dbPath));
		db.run(
			`CREATE INDEX IF NOT EXISTS active_source_anilist_id_idx ON series(source_anilist_id, state);`
		);
		console.log('Index created: source_anilist_id_idx');
	} catch (error) {
		console.error('Failed to create index:', error);
		throw error;
	}
}

createIndexes();
