<script lang="ts" >
	import { onMount } from 'svelte';
	import type { Tables } from '$lib/supabase';
	import BreweryCard from '../components/BreweryCard.svelte';

	export let data;
	// import breweriesData from '../assets/brewries.json';
	const breweries: Tables<"brewries">[] = data.breweries;
	console.log(breweries);

	let selectedBreweries = [];


	onMount(async () => {
		const  L = await import('leaflet');

		function createPopupContent(brewery) {
			return `
      <div class="popup-content">
        <h3>${brewery.name}</h3>
        <p>${brewery.type}</p>
        <p>Rating: ${brewery.rating}/5</p>
        <p>${brewery.address}</p>
      </div>
    `;
		}

		const initialView = new L.LatLng(-33.89655456778862, 151.15940896977347);

		let map: L.Map | null = null;
		function createMap(container: HTMLElement): L.Map {
			// let m = L.map(container, {preferCanvas: true }).setView(initialView, 5);
			let m = new L.Map(container, {preferCanvas: true }).setView(initialView, 16);
			L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(m);

			return m;
		}

		function mapAction(container: string | HTMLElement| null) {
			container = (typeof container === 'string')?  document.getElementById(container): container;
			if(container === null) {
				console.error('Container not found');
				return;
			}

			map = createMap(container);
			// Add markers for each brewery
			breweries.forEach(brewery => {
				console.log(brewery);
				if(brewery.lat === null || brewery.lng === null) return;
				L.marker(new L.LatLng(brewery.lat, brewery.lng))
					.bindPopup(createPopupContent(brewery))
					.addTo(map);
			});
			return {
				destroy() {
					map.remove();
					map = null;
				}
			};
		}
		mapAction(document.getElementById('map'));
	});

	// let breweries = breweriesData.breweries;


	// const initialView = [39.8283, -98.5795];


	//

	//
	function toggleBrewery(brewery) {
		const index = selectedBreweries.findIndex(b => b.id === brewery.id);
		if (index === -1) {
			selectedBreweries = [...selectedBreweries, brewery];
		} else {
			selectedBreweries = selectedBreweries.filter(b => b.id !== brewery.id);
		}
	}

	async function planRoute() {
		if (selectedBreweries.length < 2) {
			alert('Please select at least 2 breweries');
			return;
		}

		// Remove existing route if any
		map.eachLayer((layer) => {
			if (layer instanceof L.Polyline) {
				map.removeLayer(layer);
			}
		});

		// Sort breweries to create a simple route (this is where you'd implement a real routing algorithm)
		const sortedBreweries = [...selectedBreweries].sort((a, b) => a.id - b.id);
		const coordinates = sortedBreweries.map(b => [b.lat, b.lng]);

		// Draw new route
		L.polyline(coordinates, {color: 'red'}).addTo(map);

		// Fit map bounds to show all selected breweries
		const bounds = L.latLngBounds(coordinates);
		map.fitBounds(bounds, {padding: [50, 50]});
	}

	function resizeMap() {
		if(map) { map.invalidateSize(); }
	}
</script>
<svelte:window on:resize={resizeMap} />

<main class="h-screen">
	<div class="flex h-full">
		<div id="map" class="flex-grow" ></div>
		<div class="w-96 bg-gray-50 p-6 overflow-y-auto">
			<h2 class="text-2xl font-bold mb-6">Select Breweries</h2>

			<div class="space-y-4">
				{#each breweries as brewery}
					<BreweryCard
						brewery={brewery}
						isSelected={selectedBreweries.some(b => b.id === brewery.id)}
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
		</div>
	</div>
</main>

<style>
    :global(body) {
        @apply m-0 p-0 font-sans;
    }
</style>