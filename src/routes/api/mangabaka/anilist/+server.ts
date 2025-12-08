import { json, error, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { series } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';
import { rateLimiter } from '$lib/server/rate-limiter';
import { seriesCache } from '$lib/server/cache';

export async function POST({ request }: RequestEvent) {
	if (!rateLimiter.tryConsume()) {
		const retryAfter = Math.ceil(rateLimiter.getRetryAfter() / 1000);
		return new Response('Too Many Requests', {
			status: 429,
			headers: {
				'Retry-After': retryAfter.toString(),
				'X-RateLimit-Limit': '25',
				'X-RateLimit-Remaining': '0'
			}
		});
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return error(400, 'Invalid JSON body');
	}

	const { anilistIds } = body;

	if (!Array.isArray(anilistIds)) {
		return error(400, 'anilistIds must be an array');
	}

	if (anilistIds.length === 0) {
		return error(400, 'anilistIds array cannot be empty');
	}

	if (anilistIds.length > 50) {
		return error(400, 'Maximum 50 IDs per request');
	}

	const validIds = anilistIds.every(
		(id) => typeof id === 'number'
	);
	if (!validIds) {
		return error(400, 'All anilistIds must be numbers');
	}

	const stringIds = anilistIds.map((id) => String(id));

	try {
		const cachedResults: typeof series.$inferSelect[] = [];
		const uncachedIds: string[] = [];

		for (const id of stringIds) {
			const cached = seriesCache.get(id);
			if (cached) {
				cachedResults.push(cached);
			} else {
				uncachedIds.push(id);
			}
		}

		let dbResults: typeof series.$inferSelect[] = [];
		if (uncachedIds.length > 0) {
			dbResults = await db
				.select()
				.from(series)
				.where(inArray(series.sourceAnilistId, uncachedIds));

			for (const result of dbResults) {
				if (result.sourceAnilistId) {
					seriesCache.set(String(result.sourceAnilistId), result);
				}
			}
		}

		const allResults = [...cachedResults, ...dbResults];

		return json({
			count: allResults.length,
			data: allResults
		});
	} catch (err) {
		console.error('Database query error:', err);
		return error(500, 'Internal server error');
	}
};

export async function GET({ url }: RequestEvent) {
	if (!rateLimiter.tryConsume()) {
		const retryAfter = Math.ceil(rateLimiter.getRetryAfter() / 1000);
		return new Response('Too Many Requests', {
			status: 429,
			headers: {
				'Retry-After': retryAfter.toString(),
				'X-RateLimit-Limit': '25',
				'X-RateLimit-Remaining': '0'
			}
		});
	}

	const idsParam = url.searchParams.get('ids');

	if (!idsParam) {
		return error(400, 'Missing "ids" query parameter');
	}

	const anilistIds = idsParam.split(',').map((id: string) => id.trim());

	if (anilistIds.length === 0) {
		return error(400, 'At least one ID is required');
	}

	if (anilistIds.length > 50) {
		return error(400, 'Maximum 50 IDs per request');
	}

	try {
		const cachedResults: typeof series.$inferSelect[] = [];
		const uncachedIds: string[] = [];

		for (const id of anilistIds) {
			const cached = seriesCache.get(id);
			if (cached) {
				cachedResults.push(cached);
			} else {
				uncachedIds.push(id);
			}
		}

		let dbResults: typeof series.$inferSelect[] = [];
		if (uncachedIds.length > 0) {
			dbResults = await db
				.select()
				.from(series)
				.where(inArray(series.sourceAnilistId, uncachedIds));

			for (const result of dbResults) {
				if (result.sourceAnilistId) {
					seriesCache.set(String(result.sourceAnilistId), result);
				}
			}
		}

		const allResults = [...cachedResults, ...dbResults];

		return json({
			count: allResults.length,
			data: allResults
		});
	} catch (err) {
		console.error('Database query error:', err);
		return error(500, 'Internal server error');
	}
};