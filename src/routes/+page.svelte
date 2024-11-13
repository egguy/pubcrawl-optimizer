<script lang="ts">
	import BreweryCard from '../components/BreweryCard.svelte';
	import { MarkerIcon } from '$lib/icons';
	import {
		divIcon,
		geoJSON,
		LatLng,
		Map,
		Marker,
		// marker,
		Polyline,
		polyline,
		tileLayer
	} from 'leaflet';
	import type { BrewerySteps, RouteQuery } from '$lib/types';
	import type { VroomResponse } from '$lib/routeoptimiser';
	import type { Feature, FeatureCollection } from 'geojson';

	import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
	import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
	import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
	import * as L from 'leaflet';
	import type { SelectBrewery } from '$lib/server/db/schema';

	L.Icon.Default.prototype.options.iconUrl = markerIconUrl;
	L.Icon.Default.prototype.options.iconRetinaUrl = markerIconRetinaUrl;
	L.Icon.Default.prototype.options.shadowUrl = markerShadowUrl;
	L.Icon.Default.imagePath = ''; // necessary to avoid Leaflet adds some prefix to image path.

	interface BreweryCoordinate {
		marker: Marker;
		brewery: SelectBrewery;
	}

	let { data } = $props();
	const breweries: SelectBrewery[] = data.breweries;
	let selectedBreweries: SelectBrewery[] = $state([]);
	let startPoint: LatLng | null = $state(null);
	let sameEndPoint = false;
	let endPoint: LatLng | null = $state(null);

	const breweriesCoordinates: BreweryCoordinate[] = breweries.map((brewery) => {
		const location = new LatLng(brewery.lat, brewery.lng);
		const marker = L.marker(location, { icon: creatMarker(brewery) }).bindPopup(
			createPopupContent(brewery)
		);
		return { marker, brewery };
	});

	let steps: BrewerySteps[] = $state([]);

	let routingResult: VroomResponse | null = $state(null);
	// let totalDuration = 0;
	let totalDistance = $state(0);

	const initialView = new LatLng(-33.9055456778862, 151.15940896977347); // latLngBounds(breweriesCoordinates.map((b) => b.marker.getLatLng())).getCenter();

	let map: Map | null = null;
	const routeLayer = L.featureGroup();

	function createPopupContent(brewery: SelectBrewery) {
		return `
      <div class="popup-content">
        <h3>${brewery.name}</h3>
        <p>${brewery.address}</p>
      </div>
    `;
	}

	function isSelected(brewery: SelectBrewery): boolean {
		return selectedBreweries.some((b) => b.id === brewery.id);
	}

	function creatMarker(brewery: SelectBrewery, color?: string) {
		if (!color) {
			if (isSelected(brewery)) {
				color = 'red';
			} else {
				color = '0000';
			}
		}
		const html = `<div class="map-marker" style="color: ${color}">
										${MarkerIcon}
								</div>`;
		return divIcon({
			html,
			className: 'map-marker',
			iconSize: [40, 40],
			iconAnchor: [20, 5]
		});
	}

	function createMap(container: HTMLElement): Map {
		let m = new Map(container, { preferCanvas: true }).setView(initialView, 16);
		tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(m);
		routeLayer.addTo(m);
		return m;
	}

	function mapAction(container: string | HTMLElement | null) {
		container = typeof container === 'string' ? document.getElementById(container) : container;
		if (container === null) {
			console.error('Container not found');
			return;
		}

		map = createMap(container);
		// Add markers for each brewery
		breweriesCoordinates.forEach((brewery) => {
			if (!map) {
				return;
			}
			brewery.marker.addTo(map);
		});

		map.on('click', onMapClick);

		return {
			destroy() {
				if (!map) {
					return;
				}
				map.remove();
				map = null;
			}
		};
	}

	mapAction(document.getElementById('map'));

	function toggleBrewery(brewery: SelectBrewery) {
		const breweryCoordinate = breweriesCoordinates.find((b) => b.brewery.id === brewery.id);
		if (!breweryCoordinate) {
			return;
		}

		if (selectedBreweries.some((b) => b.id === brewery.id)) {
			// deselect
			selectedBreweries = selectedBreweries.filter((b) => b.id !== brewery.id);
			breweryCoordinate.marker.setIcon(creatMarker(brewery));
		} else {
			selectedBreweries = [...selectedBreweries, brewery];
			breweryCoordinate.marker.setIcon(creatMarker(brewery));
		}
	}

	async function planRoute() {
		if (selectedBreweries.length < 2) {
			alert('Please select at least 2 breweries');
			return;
		}
		if (!map) {
			return;
		}

		// Remove existing route if any
		map.eachLayer((layer) => {
			if (layer instanceof Polyline) {
				map?.removeLayer(layer);
			}
		});
		// clear steps
		steps = [];
		routingResult = null;

		// generate list of breweries location
		if (!startPoint || !endPoint) {
			alert('Please select start and end point');
			return;
		}
		const routeQuery: RouteQuery = {
			start: [startPoint.lng, startPoint.lat],
			end: [endPoint.lng, endPoint.lat],
			breweries: selectedBreweries.map((brewery) => {
				return { id: brewery.id, lat: brewery.lat, lng: brewery.lng };
			})
		};
		const response = await fetch('/api/optimiser', {
			method: 'POST',
			body: JSON.stringify(routeQuery),
			headers: {
				'content-type': 'application/json'
			}
		});
		if (!response.ok) {
			alert('Failed to plan route');
			return;
		}

		routingResult = await response.json();
		if (!routingResult) {
			alert('Failed to plan route');
			return;
		}

		let lastTravelTime = 0;
		steps = routingResult.routes[0].steps.reduce((acc, step) => {
			if (step.type === 'start' || step.type === 'end') {
				acc.push({
					step,
					brewery: null,
					travelTime: step.type === 'start' ? 0 : step.duration - lastTravelTime
				});
				return acc;
			}

			const brewery = breweries.find((b) => b.id === step.id);
			if (brewery) {
				acc.push({ brewery, step, travelTime: step.duration - lastTravelTime });
				lastTravelTime = step.duration;
			}
			return acc;
		}, [] as BrewerySteps[]);

		// Extract coordinates from the response
		const coordinates = routingResult.routes[0].steps.map((step) => {
			return new LatLng(step.location[1], step.location[0]);
		});

		routeLayer.clearLayers();
		const routes: Feature[] = [];
		// get route between each pair of points
		await Promise.all(
			coordinates.map(async (coordinate, index) => {
				if (index < coordinates.length - 1) {
					const nextCoordinate = coordinates[index + 1];
					const query = {
						start: [coordinate.lng, coordinate.lat],
						end: [nextCoordinate.lng, nextCoordinate.lat]
					};

					try {
						const data = await fetch('/api/router', {
							method: 'POST',
							body: JSON.stringify(query),
							headers: {
								'Content-Type': 'application/json'
							}
						});
						const response: FeatureCollection = await data.json();

						L.geoJSON(response.features[0]).addTo(routeLayer);
						totalDistance += response.features.reduce((acc, feature) => {
							// round to nearest meter
							acc += Math.round(feature.properties?.summary.distance);
							return acc;
						}, 0);
						// routeLayer.();
					} catch (error) {
						console.error(error);
						polyline([coordinate, nextCoordinate], { color: 'red' }).addTo(routeLayer);
					}

					geoJSON(routes).addTo(routeLayer);
					// .addTo(map);
				}
			})
		);

		map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
	}

	function resizeMap() {
		if (map) {
			map.invalidateSize();
		}
	}

	function onMapClick(e: L.LeafletMouseEvent) {
		if (!map) {
			return;
		}
		if (startPoint === null) {
			startPoint = e.latlng;
			new L.Marker(e.latlng).addTo(map);
			if (sameEndPoint) {
				endPoint = e.latlng;
			}
		} else if (endPoint === null) {
			endPoint = e.latlng;
			new L.Marker(e.latlng).addTo(map);
		}
	}

	function updateEndPoint() {
		sameEndPoint = !sameEndPoint;
		if (sameEndPoint) {
			endPoint = startPoint;
		}
	}
</script>

<svelte:window onresize={resizeMap} />

<main class="h-screen">
	<div class="flex w-full">
		<!-- input for start point -->
		<div>
			<span class="mr-3">Start Point :{startPoint ? '✔' : '❌'}</span>

			<input type="checkbox" name="same" id="same" onchange={updateEndPoint} />
			<label for="same" class="mr-3">Same as End Point</label>
			<span>End Point :{endPoint ? '✔' : '❌'}</span>
		</div>
	</div>
	<div class="flex h-full">
		<div id="map" class="flex-grow" use:mapAction></div>
		<div class="w-96 overflow-y-auto bg-gray-50 p-6">
			<h2 class="mb-6 text-2xl font-bold">Select Breweries</h2>

			<div class="space-y-4">
				{#each breweriesCoordinates as breweryCoordinate}
					<BreweryCard
						brewery={breweryCoordinate.brewery}
						isSelected={selectedBreweries.some((b) => b.id === breweryCoordinate.brewery.id)}
						toggle={toggleBrewery}
						onmouseenter={() => {
							breweryCoordinate.marker.setIcon(creatMarker(breweryCoordinate.brewery, 'green'));
						}}
						onmouseleave={() =>
							breweryCoordinate.marker.setIcon(creatMarker(breweryCoordinate.brewery))}
					/>
				{/each}
			</div>

			<button
				onclick={planRoute}
				disabled={selectedBreweries.length < 2}
				class="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white
               transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
               focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
			>
				Visit {selectedBreweries.length} Selected {selectedBreweries.length === 1
					? 'Brewery'
					: 'Breweries'}
			</button>
			{#if routingResult}
				<div class="mt-6">
					<h2 class="mb-6 text-2xl font-bold">Route</h2>
					<p>
						Total Duration: {routingResult.summary.duration}s ({totalDistance}m)
					</p>
					<div class="space-y-4">
						{#each steps as step}
							{#if step.step.type !== 'start'}
								<!-- Show travel time for each step except the start and centered-->
								<div class="text-center">
									<p>↓ Travel Time: {step.travelTime}s</p>
								</div>
							{/if}
							<div class="rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md">
								{#if step.step.type === 'start'}
									<p>Start</p>
								{:else if step.step.type === 'end'}
									<p>End</p>
								{:else}
									<p>{step.brewery?.name}</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
</main>

