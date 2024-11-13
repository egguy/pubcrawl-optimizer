import { db } from '$lib/server/db';
import { brewery, type SelectBrewery } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// export const prerender = false;

export async function load() {
	const results: SelectBrewery[] = await db.select().from(brewery).where(eq(brewery.active, true));
	console.log(results);
	return {
		breweries: results ?? []
	};
}
