import { db } from '$lib/server/db';
import { brewery, tags } from '$lib/server/db/schema';
import { displayTags } from '$lib/tags';
import { eq, inArray } from 'drizzle-orm';
import type { BreweryTags } from '$lib/types';

export async function load() {
	try {
		const tagKeys = Array.from(displayTags.keys());
		if (!tagKeys.length) {
			console.warn('No display tags configured');
		}
		const results: BreweryTags[] = await db.query.brewery.findMany({
			where: eq(brewery.active, true),
			with: {
				tags: {
					columns: {
						key: true,
						value: true
					},
					where: inArray(tags.key, tagKeys)
				}
			}
		});
		return {
			breweries: results ?? []
		};
	} catch (error) {
		console.error('Failed to fetch breweries with tags:', error, {
			activeOnly: true,
			tagKeys: Array.from(displayTags.keys())
		});
		throw error;
	}
}
