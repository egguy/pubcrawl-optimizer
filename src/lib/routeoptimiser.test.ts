import { RouteOptimizer } from './routeoptimiser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RouteQuery } from '$lib/types';

describe('RouteOptimizer', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	const routeOptimizer = new RouteOptimizer();

	it('optimizes route with valid input', async () => {
		const routeQuery: RouteQuery = {
			start: [151.15940896977347, -33.9055456778862],
			end: [151.15940896977347, -33.9055456778862],
			breweries: [
				{ id: 1, lat: -33.9055456778862, lng: 151.15940896977347 },
				{ id: 2, lat: -33.9055456778862, lng: 151.15940896977347 }
			]
		};

		const result = await routeOptimizer.optimizeRoute(routeQuery);

		expect(result).toHaveProperty('code', 0);
		expect(result.routes[0].steps.length).toBeGreaterThan(0);
	});

	it('throws error when less than 2 locations are provided', async () => {
		const routeQuery: RouteQuery = {
			start: [151.15940896977347, -33.9055456778862],
			end: [151.15940896977347, -33.9055456778862],
			breweries: [{ id: 1, lat: -33.9055456778862, lng: 151.15940896977347 }]
		};

		await expect(routeOptimizer.optimizeRoute(routeQuery)).rejects.toThrow(
			'Need at least 2 locations to optimize route'
		);
	});

	it('throws error when API call fails', async () => {
		const routeQuery: RouteQuery = {
			start: [151.15940896977347, -33.9055456778862],
			end: [151.15940896977347, -33.9055456778862],
			breweries: [
				{ id: 1, lat: -33.9055456778862, lng: 151.15940896977347 },
				{ id: 2, lat: -33.9055456778862, lng: 151.15940896977347 }
			]
		};

		const originalFetch = global.fetch;
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			statusText: 'Internal Server Error'
		});

		await expect(routeOptimizer.optimizeRoute(routeQuery)).rejects.toThrow(
			'API call failed: Internal Server Error'
		);

		global.fetch = originalFetch;
	});

	it('throws error when response is invalid', async () => {
		const routeQuery: RouteQuery = {
			start: [151.15940896977347, -33.9055456778862],
			end: [151.15940896977347, -33.9055456778862],
			breweries: [
				{ id: 1, lat: -33.9055456778862, lng: 151.15940896977347 },
				{ id: 2, lat: -33.9055456778862, lng: 151.15940896977347 }
			]
		};

		const originalFetch = global.fetch;
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ code: 1 })
		});

		await expect(routeOptimizer.optimizeRoute(routeQuery)).rejects.toThrow(
			'Invalid response from optimization service'
		);

		global.fetch = originalFetch;
	});
});
