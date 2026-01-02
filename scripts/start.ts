import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { setupDatabase } from './setupDatabase.js';
import { x as extract } from 'tar';
import 'dotenv/config';

const DB_ARCHIVE = 'series.sqlite.tar.gz';
const TS_URL = 'https://api.mangabaka.dev/v1/database/series.timestamp.txt';
const DB_URL = `https://api.mangabaka.dev/v1/database/${DB_ARCHIVE}`;

const LOCAL_TS_FILE = process.env.LOCAL_TS_FILE || 'series.timestamp.local';
const DB_FILE = process.env.DATABASE_URL || 'series.sqlite';
let server: ChildProcess | null = null;

function fetch(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				if (res.statusCode !== 200) {
					reject(new Error(`HTTP ${res.statusCode}`));
					return;
				}
				let data = '';
				res.on('data', (chunk) => (data += chunk));
				res.on('end', () => resolve(data.trim()));
			})
			.on('error', reject);
	});
}

async function downloadFile(url: string, dest: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(dest);
		https
			.get(url, (res) => {
				if (res.statusCode !== 200) {
					reject(new Error(`HTTP ${res.statusCode}`));
					return;
				}
				res.pipe(file);
				file.on('finish', () => file.close(() => resolve()));
			})
			.on('error', reject);
	});
}

async function updateDatabase(logMessage: string, remoteTS: string): Promise<boolean> {
	console.log(logMessage);
	const dbDir = path.dirname(DB_FILE);
	const archivePath = path.join(dbDir, DB_ARCHIVE);

	if (!fs.existsSync(dbDir)) {
		fs.mkdirSync(dbDir, { recursive: true });
	}

	await downloadFile(DB_URL, archivePath);
	await extract({ file: archivePath, cwd: dbDir });
	fs.unlinkSync(archivePath);
	fs.writeFileSync(LOCAL_TS_FILE, remoteTS);
	setupDatabase();
	console.log('Database updated.');
	return true;
}

function startServer() {
	if (server) {
		server.kill();
	}

	process.env.PORT = process.env.PORT && process.env.PORT !== '' ? process.env.PORT : '3000';

	server = spawn('node', ['build/index.js'], {
		stdio: 'inherit'
	});

	server.on('exit', (code) => {
		console.log(`Server exited with code ${code}`);
	});
}

async function check() {
	try {
		const remoteTS = await fetch(TS_URL);

		let updated = false;
		let localTS = null;
		let localEpoch = 0;
		const remoteEpoch = Date.parse(remoteTS);

		if (!fs.existsSync(LOCAL_TS_FILE)) {
			updated = await updateDatabase('No local timestamp found. Downloading database...', remoteTS);
		} else {
			localTS = fs.readFileSync(LOCAL_TS_FILE, 'utf8').trim();
			localEpoch = Date.parse(localTS);
			if (remoteEpoch > localEpoch) {
				updated = await updateDatabase('New database found. Downloading...', remoteTS);
			}
		}

		if (updated && fs.existsSync(DB_FILE)) {
			console.log('Restarting server...');
			startServer();
		} else if (fs.existsSync(DB_FILE) && !server) {
			console.log('Starting server...');
			startServer();
		}
	} catch (e) {
		console.error('Error during check:', e);
	}
}

check();

setInterval(check, 6 * 60 * 60 * 1000);
