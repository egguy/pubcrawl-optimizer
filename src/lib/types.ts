import type { Tables } from '$lib/supabase';
import type { VroomStep } from '$lib/routeoptimiser';

export type Brewery = Tables<'brewries'>;
export type BreweryLocation = Pick<Brewery, 'id' | 'lat' | 'lng'>;

export interface BrewerySteps {
	brewery: Brewery;
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
