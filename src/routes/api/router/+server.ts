import { error } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import type { LongLat } from '$lib/types';
import { cachedRouting, type OSRRouteQuery } from '$lib/routing';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const breweries = (await request.json()) as {
		start: LongLat;
		end: LongLat;
	};

	const query: OSRRouteQuery = {
		profile: 'foot-walking',
		start: breweries.start,
		end: breweries.end
	};

	try {
		const response = await cachedRouting(query);
		return json(response);
	} catch (err) {
		console.error(err);
		return error(400, 'Error creating route');
	}
}
