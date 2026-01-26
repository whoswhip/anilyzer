import Database from 'better-sqlite3';
import fs from 'fs';
import 'dotenv/config';

const dbPath = process.env.DATABASE_URL || './series.sqlite';

function createIndexes() {
	if (!fs.existsSync(dbPath)) {
		console.warn('Database file not found, skipping index creation');
		return;
	}

	try {
		const db = new Database(dbPath);

		db.prepare(
			`CREATE INDEX IF NOT EXISTS source_anilist_id_idx ON series(source_anilist_id);`
		).run();

		console.log('Index created: source_anilist_id_idx');

		db.close();
	} catch (error) {
		console.error('Failed to create index:', error);
		throw error;
	}
}

function keepActiveOnly() {
	if (!fs.existsSync(dbPath)) {
		console.warn('Database file not found, skipping data cleanup');
		return;
	}

	try {
		const db = new Database(dbPath);

		const deleteStmt = db.prepare(`DELETE FROM series WHERE state != 'active';`);
		const result = deleteStmt.run();

		console.log(`Deleted ${result.changes} inactive series entries.`);

		db.close();
	} catch (error) {
		console.error('Failed to clean up inactive series:', error);
		throw error;
	}
}

export function setupDatabase() {
	keepActiveOnly();
	createIndexes();
}

createIndexes();
keepActiveOnly();
