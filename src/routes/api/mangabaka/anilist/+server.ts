import { json, error, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { series } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';
import { rateLimiter } from '$lib/server/rate-limiter';
import { seriesCache } from '$lib/server/cache';
import type { MangabakaSeries } from '$lib/types/series';

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
		const cachedResults: MangabakaSeries[] = [];
		const uncachedIds: string[] = [];

		for (const id of anilistIds) {
			const cached = seriesCache.get(id);
			if (cached) {
				cachedResults.push(cached as MangabakaSeries);
			} else {
				uncachedIds.push(id);
			}
		}

		let dbResults: MangabakaSeries[] = [];
		if (uncachedIds.length > 0) {
			const baseSelection = {
				id: series.id,
				state: series.state,
				title: series.title,
				nativeTitle: series.nativeTitle,
				romanizedTitle: series.romanizedTitle,
				secondaryTitlesEn: series.secondaryTitlesEn,
				coverRawUrl: series.coverRawUrl,
				coverRawSize: series.coverRawSize,
				coverRawWidth: series.coverRawWidth,
				coverRawFormat: series.coverRawFormat,
				coverRawHeight: series.coverRawHeight,
				coverRawBlurhash: series.coverRawBlurhash,
				coverRawThumbhash: series.coverRawThumbhash,
				coverX150X1: series.coverX150X1,
				coverX150X2: series.coverX150X2,
				coverX150X3: series.coverX150X3,
				coverX250X1: series.coverX250X1,
				coverX250X2: series.coverX250X2,
				coverX250X3: series.coverX250X3,
				coverX350X1: series.coverX350X1,
				coverX350X2: series.coverX350X2,
				coverX350X3: series.coverX350X3,
				authors: series.authors,
				artists: series.artists,
				description: series.description,
				year: series.year,
				status: series.status,
				isLicensed: series.isLicensed,
				hasAnime: series.hasAnime,
				anime: series.anime,
				contentRating: series.contentRating,
				type: series.type,
				rating: series.rating,
				finalVolume: series.finalVolume,
				finalChapter: series.finalChapter,
				totalChapters: series.totalChapters,
				links: series.links,
				publishers: series.publishers,
				relationships: series.relationships,
				genres: series.genres,
				genresV2: series.genresV2,
				tags: series.tags,
				tagsV2: series.tagsV2,
				lastUpdatedAt: series.lastUpdatedAt,
				sourceAnilistId: series.sourceAnilistId,
				sourceAnilistRatingNormalized: series.sourceAnilistRatingNormalized,
				relationshipsAlternative: series.relationshipsAlternative,
				relationshipsPrequel: series.relationshipsPrequel,
				relationshipsSequel: series.relationshipsSequel,
				relationshipsSideStory: series.relationshipsSideStory,
				relationshipsSpinOff: series.relationshipsSpinOff,
				relationshipsOther: series.relationshipsOther,
				relationshipsAdaptation: series.relationshipsAdaptation,
				relationshipsMainStory: series.relationshipsMainStory
			};

			const selectFields =
				process.env.DATABASE_FULL === 'true'
					? {
							...baseSelection,
							sourceMyAnimeListResponsePopularity: (series as any).sourceMyAnimeListResponsePopularity,
							sourceAnilistResponsePopularity: (series as any).sourceAnilistResponsePopularity
						}
					: baseSelection;

			dbResults = (await db
				.select(selectFields)
				.from(series)
				.where(inArray(series.sourceAnilistId, uncachedIds))) as unknown as MangabakaSeries[];

			for (const result of dbResults) {
				if (result.sourceAnilistId) {
					seriesCache.set(String(result.sourceAnilistId), result);
				}
			}
		}

		const allResults = [...cachedResults, ...dbResults];

		return json({
			count: allResults.length,
			data: allResults,
			cachedCount: cachedResults.length
		});
	} catch (err) {
		console.error('Database query error:', err);
		return error(500, 'Internal server error');
	}
}
