<script lang="ts">
	import BreweryCard from '../components/BreweryCard.svelte';
	import {  MarkerIcon } from '$lib/icons';
	import { divIcon, LatLng, latLngBounds, Map, marker, Polyline, polyline, tileLayer } from 'leaflet';
	import type { Brewery, BreweryLocation, BrewerySteps } from '$lib/types';
	import type { VroomResponse } from '$lib/routeoptimiser';


	export let data;
	const breweries: Brewery[] = data.breweries;
	let steps: BrewerySteps[] = [];

	let selectedBreweries: Brewery[] = [];
	let routingResult: VroomResponse | null = null;


	function createPopupContent(brewery: Brewery) {
		return `
      <div class="popup-content">
        <h3>${brewery.name}</h3>
        <p>${brewery.address}</p>
      </div>
    `;
	}

	function creatMarker() {
		const html = `<div class="map-marker"><div>${MarkerIcon}</div></div>`;
		return divIcon({
			html,
			className: 'map-marker'
		});
	}

	const initialView = new LatLng(-33.89655456778862, 151.15940896977347);

	let map: Map | null = null;

	function createMap(container: HTMLElement): Map {
		let m = new Map(container, { preferCanvas: true }).setView(initialView, 16);
		tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(m);

		return m;
	}

	function mapAction(container: string | HTMLElement | null) {
		container = (typeof container === 'string') ? document.getElementById(container) : container;
		if (container === null) {
			console.error('Container not found');
			return;
		}

		map = createMap(container);
		// Add markers for each brewery
		breweries.forEach(brewery => {
			console.log(brewery);
			if (!map) {
				return;
			}
			const location = new LatLng(brewery.lat, brewery.lng);
			marker(location, { icon: creatMarker() })
				.bindPopup(createPopupContent(brewery))
				.addTo(map);
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
		if (selectedBreweries.some(b => b.id === brewery.id)) {
			selectedBreweries = selectedBreweries.filter(b => b.id !== brewery.id);
		} else {
			selectedBreweries = [...selectedBreweries, brewery];
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
		const breweriesCoordinates: BreweryLocation[] = selectedBreweries.map(brewery => {
			return { id: brewery.id, lat: brewery.lat, lng: brewery.lng };
		});

		const response = await fetch('/api/routing', {
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
		if(!routingResult) {
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

			const brewery = breweries.find(b => b.id === step.id);
			if (brewery) {
				acc.push({ brewery, step, travelTime: step.duration - lastTravelTime });
				lastTravelTime = step.duration;
			}
			return acc;
		}, [] as BrewerySteps[]);
		console.log(steps);

		// Extract coordinates from the response
		const coordinates = routingResult.routes[0].steps.map(step => {
			return new LatLng(step.location[1], step.location[0]);
		});

		// Draw new route
		polyline(coordinates, { color: 'red' }).addTo(map);

		// Fit map bounds to show all selected breweries
		const bounds = latLngBounds(coordinates);
		map.fitBounds(bounds, { padding: [50, 50] });
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
				{#each breweries as brewery}
					<BreweryCard
						brewery={brewery}
						isSelected={selectedBreweries.some(b => b.id === brewery.id)}
						on:toggle={toggleBrewery}
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
				Visit {selectedBreweries.length} Selected {selectedBreweries.length === 1 ? 'Brewery' : 'Breweries'}
			</button>
			{#if routingResult}
				<div class="mt-6">
					<h2 class="text-2xl font-bold mb-6">Route</h2>
					<p>
						Total Duration: {routingResult.summary.duration}s
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