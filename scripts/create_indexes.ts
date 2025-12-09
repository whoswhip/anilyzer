import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import 'dotenv/config';

export function createIndexes() {
    const dbPath = process.env.DATABASE_URL || './series.sqlite';
    const db = drizzle(new Database(dbPath));
    db.run(`CREATE INDEX IF NOT EXISTS source_anilist_id_idx ON series (source_anilist_id);`);
    console.log('Index created: source_anilist_id_idx');
}

createIndexes();