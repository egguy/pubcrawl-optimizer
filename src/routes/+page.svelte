<script lang="ts">
	import BreweryCard from '../components/BreweryCard.svelte';
	import { MarkerIcon } from '$lib/icons';
	import {
		divIcon,
		geoJSON,
		LatLng,
		latLngBounds,
		Map,
		Marker,
		// marker,
		Polyline,
		polyline,
		tileLayer
	} from 'leaflet';
	import type { Brewery, BreweryLocation, BrewerySteps } from '$lib/types';
	import type { VroomResponse } from '$lib/routeoptimiser';
	import type { Feature, FeatureCollection } from 'geojson';

	import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
	import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
	import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
	import * as L from 'leaflet';
	L.Icon.Default.prototype.options.iconUrl = markerIconUrl;
	L.Icon.Default.prototype.options.iconRetinaUrl = markerIconRetinaUrl;
	L.Icon.Default.prototype.options.shadowUrl = markerShadowUrl;
	L.Icon.Default.imagePath = ''; // necessary to avoid Leaflet adds some prefix to image path.

	interface BreweryCoordinate {
		marker: Marker;
		brewery: Brewery;
	}

	export let data;
	const breweries: Brewery[] = data.breweries;
	let selectedBreweries: Brewery[] = [];

	const breweriesCoordinates: BreweryCoordinate[] = breweries.map((brewery) => {
		const location = new LatLng(brewery.lat, brewery.lng);
		const marker = L.marker(location, { icon: creatMarker(brewery) }).bindPopup(
			createPopupContent(brewery)
		);
		return { marker, brewery };
	});

	let steps: BrewerySteps[] = [];


	let routingResult: VroomResponse | null = null;
	// let totalDuration = 0;
	let totalDistance = 0;

	const initialView = latLngBounds(breweriesCoordinates.map((b) => b.marker.getLatLng()));

	let map: Map | null = null;
	const routeLayer = L.featureGroup();


	function createPopupContent(brewery: Brewery) {
		return `
      <div class="popup-content">
        <h3>${brewery.name}</h3>
        <p>${brewery.address}</p>
      </div>
    `;
	}
	function isSelected(brewery: Brewery):boolean {
		return selectedBreweries.some((b) => b.id === brewery.id);
	}

	function creatMarker(brewery: Brewery, color?: string) {
		if(!color){
			if(isSelected(brewery)){
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
		let m = new Map(container, { preferCanvas: true }).setView(initialView.getCenter(), 14);
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

	function toggleBrewery(event: CustomEvent<Brewery>) {
		const brewery = event.detail;
		// get brewryCooridnate object
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
		console.log(selectedBreweries);
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
		const breweriesCoordinates: BreweryLocation[] = selectedBreweries.map((brewery) => {
			return { id: brewery.id, lat: brewery.lat, lng: brewery.lng };
		});

		const response = await fetch('/api/optimiser', {
			method: 'POST',
			body: JSON.stringify(breweriesCoordinates),
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
					brewery: selectedBreweries[0],
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
		console.log(steps);

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
						console.log('Route sugession', response);

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
</script>

<svelte:window on:resize={resizeMap} />

<main class="h-screen">
	<div class="flex h-full">
		<div id="map" class="flex-grow" use:mapAction></div>
		<div class="w-96 bg-gray-50 p-6 overflow-y-auto">
			<h2 class="text-2xl font-bold mb-6">Select Breweries</h2>

			<div class="space-y-4">
				{#each breweriesCoordinates as breweryCoordinate}
					<BreweryCard
						brewery={breweryCoordinate.brewery}
						isSelected={selectedBreweries.some((b) => b.id === breweryCoordinate.brewery.id)}
						on:toggle={toggleBrewery}
						on:mouseenter={() => {breweryCoordinate.marker.setIcon(creatMarker(breweryCoordinate.brewery, 'green')); console.log('hover')}}
						on:mouseleave={() => breweryCoordinate.marker.setIcon(creatMarker(breweryCoordinate.brewery))}
					/>
				{/each}
			</div>

			<button
				on:click={planRoute}
				disabled={selectedBreweries.length < 2}
				class="w-full mt-6 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg
               hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
               disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
			>
				Visit {selectedBreweries.length} Selected {selectedBreweries.length === 1
					? 'Brewery'
					: 'Breweries'}
			</button>
			{#if routingResult}
				<div class="mt-6">
					<h2 class="text-2xl font-bold mb-6">Route</h2>
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
							<div class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
								{#if step.step.type === 'start'}
									<p>Start at {step.brewery.name}</p>
								{:else if step.step.type === 'end'}
									<p>End at {step.brewery.name}</p>
								{:else}
									<p>{step.brewery.name}</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
</main>

<style>
	:global(body) {
		@apply m-0 p-0 font-sans;
	}
</style>
