import { ORS_TOKEN } from '$env/static/private';
import type { LongLat, routingProfile } from '$lib/types';
import type { RouteQuery } from '$lib/types';

interface VroomJob {
	id: number;
	location: LongLat; // [longitude, latitude]
}

interface Vehicle {
	id: number;
	profile: routingProfile;
	start: LongLat;
	end: LongLat;
}

interface VroomRequest {
	jobs: VroomJob[];
	vehicles: Vehicle[];
}

export interface VroomStep {
	type: 'start' | 'job' | 'end';
	job?: number;
	id?: number;
	location: LongLat;
	arrival: number;
	duration: number;
	waiting_time: number;
	service: number;
	distance?: number;
}

interface VroomRoute {
	steps: VroomStep[];
}

interface Summary {
	cost: number;
	routes: number;
	unassigned: number;
	setup: number;
	service: number;
	duration: number;
	waiting_time: number;
	priority: number;
	// violations: any[];
	computing_times: {
		loading: number;
		solving: number;
		routing: number;
	};
}

export interface VroomResponse {
	code: number;
	summary: Summary;
	routes: VroomRoute[];
}

export class RouteOptimizer {
	private apiKey: string = ORS_TOKEN;
	private baseUrl = 'https://api.openrouteservice.org/optimization';

	async optimizeRoute(route: RouteQuery): Promise<VroomResponse> {
		const breweries = route.breweries;
		if (breweries.length < 2) {
			throw new Error('Need at least 2 locations to optimize route');
		}

		const request = this.createVroomRequest(route);
		const optimizedRoute = await this.callOptimizationApi(request);

		return this.processResponse(optimizedRoute);
	}

	private createVroomRequest(route: RouteQuery): VroomRequest {
		const jobs: VroomJob[] = route.breweries.map((brewery) => ({
			id: brewery.id,
			location: [brewery.lng, brewery.lat]
		}));

		return {
			jobs,
			vehicles: [
				{
					id: 0,
					profile: 'foot-walking',
					start: route.start,
					end: route.end
				}
			]
		};
	}

	private async callOptimizationApi(request: VroomRequest): Promise<VroomResponse> {
		const response = await fetch(this.baseUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: this.apiKey
			},
			body: JSON.stringify(request)
		});

		if (!response.ok) {
			throw new Error(`API call failed: ${response.statusText}`);
		}

		return response.json();
	}

	private processResponse(response: VroomResponse): VroomResponse {
		if (response.code !== 0 || !response.routes?.[0]) {
			throw new Error('Invalid response from optimization service');
		}
		return response;
	}
}
