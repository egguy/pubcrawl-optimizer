import type { Tables } from '$lib/supabase';
import type { VroomStep } from '$lib/routeoptimiser';

export type Brewery = Tables<'brewries'>;
export type BreweryLocation = Pick<Brewery, "id"|"lat"|"lng">;

export interface BrewerySteps {
	brewery: Brewery;
	step: VroomStep;
}