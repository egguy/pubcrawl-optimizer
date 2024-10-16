import type { Tables } from '$lib/supabase';
import type { VroomStep } from '$lib/routeoptimiser';

export type Brewery = Tables<'brewery'>;

export type BreweryLocation = Pick<Brewery, 'id' | 'lat' | 'lng'>;
export interface RouteQuery {
	start: LongLat;
	end: LongLat;
	breweries: BreweryLocation[];
}

export interface BrewerySteps {
	brewery: Brewery | null;
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
