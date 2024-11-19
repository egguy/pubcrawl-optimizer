import { db } from '$lib/server/db';
import { brewery, tags } from '$lib/server/db/schema';
import { displayTags } from '$lib/tags';
import { eq, inArray } from 'drizzle-orm';
import type { BreweryTags } from '$lib/types';

// export const prerender = false;

export async function load() {
	const results: BreweryTags[] = await db.query.brewery.findMany({
		where: eq(brewery.active, true),
		with: {
			tags: {
				columns: {
					key: true,
					value: true
				},
				where: inArray(tags.key, Array.from(displayTags.keys()))
			}
		}
	});
	// const results: SelectBrewery[] = await db.select().from(brewery).leftJoin(tags, eq(brewery.id, tags.brewery)).where(eq(brewery.active, true));
	return {
		breweries: results ?? []
	};
}
