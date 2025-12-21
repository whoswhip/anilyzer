import Database from 'better-sqlite3';
import fs from 'fs';
import 'dotenv/config';

export function createIndexes() {
	const dbPath = process.env.DATABASE_URL || './series.sqlite';

	if (!fs.existsSync(dbPath)) {
		console.warn('Database file not found, skipping index creation');
		return;
	}

	try {
		const db = new Database(dbPath);

		db.prepare(
			`CREATE INDEX IF NOT EXISTS active_source_anilist_id_idx ON series(source_anilist_id, state);`
		).run();

		console.log('Index created: active_source_anilist_id_idx');

		db.close();
	} catch (error) {
		console.error('Failed to create index:', error);
		throw error;
	}
}

createIndexes();
