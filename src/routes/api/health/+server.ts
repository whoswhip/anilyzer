import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { count } from 'drizzle-orm';
import { series } from '$lib/server/db/schema';

let countCache: number | null = null; // db doesnt update without a restart

export const GET = async () => {
	if (countCache === null) {
			const result = await db
				.select({ count: count() })
				.from(series);
		countCache = result[0]?.count ?? 0;
	}
	 return json({ status: 'ok', count: countCache });
};
