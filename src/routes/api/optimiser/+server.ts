import { error } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import type { RouteQuery } from '$lib/types';
import { RouteOptimizer } from '$lib/routeoptimiser';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const routeQuery = (await request.json()) as RouteQuery;
	const optimizer = new RouteOptimizer();

	try {
		const optimizedRoute = await optimizer.optimizeRoute(routeQuery);
		console.log(optimizedRoute);
		return json(optimizedRoute);
	} catch (err) {
		console.error(err);
		return error(400, 'Error creating route');
	}
}
