/*
    THIS IS EXPERIMENTAL AND LINUX ONLY
    start: npx ts-node ./scripts/start.ts
*/

import { execSync, spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import https from 'https';
import { createIndexes } from './create_indexes.ts';

const TS_URL = 'https://api.mangabaka.dev/v1/database/series.timestamp.txt';
const DB_URL = 'https://api.mangabaka.dev/v1/database/series.sqlite.zst';

const LOCAL_TS_FILE = 'series.timestamp.local';
const DB_ZST = 'series.sqlite.zst';
const DB_FILE = 'series.sqlite';

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

function startServer() {
	if (server) {
		server.kill();
	}

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
			console.log('No local timestamp found. Downloading database...');
			await downloadFile(DB_URL, DB_ZST);
			execSync(`unzstd ${DB_ZST}`);
			fs.unlinkSync(DB_ZST);
			fs.writeFileSync(LOCAL_TS_FILE, remoteTS);
			createIndexes();
			console.log('Database updated.');
			updated = true;
		} else {
			localTS = fs.readFileSync(LOCAL_TS_FILE, 'utf8').trim();
			localEpoch = Date.parse(localTS);
			if (remoteEpoch > localEpoch) {
				console.log('New database found. Downloading...');
				await downloadFile(DB_URL, DB_ZST);
				execSync(`unzstd ${DB_ZST}`);
				fs.unlinkSync(DB_ZST);
				fs.writeFileSync(LOCAL_TS_FILE, remoteTS);
				createIndexes();
				console.log('Database updated.');
				updated = true;
			}
		}

		if (updated || fs.existsSync(DB_FILE)) {
			console.log('Restarting server...');
			startServer();
		}
	} catch (e) {
		console.error('Error during check:', e);
	}
}

check();

setInterval(check, 6 * 60 * 60 * 1000);
