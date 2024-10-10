import { Map, L } from 'leaflet';
// import breweriesData from '../assets/brewries.json';


let map: Map | null;
// let selectedBreweries = [];
// let breweries = breweriesData.breweries;

const initialView = [-33.89655456778862, 151.15940896977347];

// const initialView = [39.8283, -98.5795];
function createMap(container: any) {
	// let m = L.map(container, {preferCanvas: true }).setView(initialView, 5);
	const m = new Map(container, { preferCanvas: true }).setView(initialView, 16);
	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(m);

	return m;
}

export function mapAction(container: any) {
	map = createMap(container);
	// Add markers for each brewery
	breweries.forEach((brewery) => {
		L.marker([brewery.lat, brewery.lng]).bindPopup(createPopupContent(brewery)).addTo(map);
	});
	return {
		destroy() {
			map.remove();
			map = null;
		}
	};
}

//
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
//
// function toggleBrewery(brewery) {
// 	const index = selectedBreweries.findIndex(b => b.id === brewery.id);
// 	if (index === -1) {
// 		selectedBreweries = [...selectedBreweries, brewery];
// 	} else {
// 		selectedBreweries = selectedBreweries.filter(b => b.id !== brewery.id);
// 	}
// }
//
// async function planRoute() {
// 	if (selectedBreweries.length < 2) {
// 		alert('Please select at least 2 breweries');
// 		return;
// 	}
//
// 	// Remove existing route if any
// 	map.eachLayer((layer) => {
// 		if (layer instanceof L.Polyline) {
// 			map.removeLayer(layer);
// 		}
// 	});
//
// 	// Sort breweries to create a simple route (this is where you'd implement a real routing algorithm)
// 	const sortedBreweries = [...selectedBreweries].sort((a, b) => a.id - b.id);
// 	const coordinates = sortedBreweries.map(b => [b.lat, b.lng]);
//
// 	// Draw new route
// 	L.polyline(coordinates, {color: 'red'}).addTo(map);
//
// 	// Fit map bounds to show all selected breweries
// 	const bounds = L.latLngBounds(coordinates);
// 	map.fitBounds(bounds, {padding: [50, 50]});
// }

function resizeMap() {
	if(map) { map.invalidateSize(); }
}