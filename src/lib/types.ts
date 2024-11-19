import type { VroomStep } from '$lib/routeoptimiser';
import type { SelectBrewery, SelectTags } from '$lib/server/db/schema';

export type BreweryLocation = Pick<SelectBrewery, 'id' | 'lat' | 'lng'>;
export interface RouteQuery {
	start: LongLat;
	end: LongLat;
	breweries: BreweryLocation[];
}

export interface BrewerySteps {
	brewery: SelectBrewery | null;
	step: VroomStep;
	travelTime: number;
}

export type routingProfile =
	| 'driving-car'
	| 'driving-hgv'
	| 'foot-walking'
	| 'foot-hiking'
	| 'cycling-regular'
	| 'cycling-road'
	| 'cycling-mountain'
	| 'cycling-electric';
export type LongLat = [number, number];

export type BreweryTags = SelectBrewery & { tags: Pick<SelectTags, 'key' | 'value'>[] };
