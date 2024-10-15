import { ORS_TOKEN } from '$env/static/private';
import type { LongLat, routingProfile } from '$lib/types';
import type { FeatureCollection } from 'geojson';

export interface OSRRouteQuery {
	profile: routingProfile;
	start: LongLat;
	end: LongLat;
}

const cache = new Map<string, FeatureCollection>();

export class Routing {
	private apiKey: string = ORS_TOKEN;
	private baseUrl = 'https://api.openrouteservice.org//v2/directions/';

	async fetchRouter(query: OSRRouteQuery): Promise<FeatureCollection> {
		const url = `${this.baseUrl}${query.profile}`;
		const urlParams = new URLSearchParams({
			api_key: this.apiKey,
			start: query.start.join(),
			end: query.end.join()
		});
		const response = await fetch(`${url}?${urlParams}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return (await response.json()) as FeatureCollection;
	}
}

export async function cachedRouting(query: OSRRouteQuery) {
	const key = JSON.stringify(query);
	if (cache.has(key)) {
		return cache.get(key);
	}
	const routing = new Routing();
	const route = await routing.fetchRouter(query);
	cache.set(key, route);
	return route;
}
