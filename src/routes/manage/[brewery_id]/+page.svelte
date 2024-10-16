<script lang="ts">
	import { DefaultMarker, MapLibre, Popup } from 'svelte-maplibre';

	/** @type {import('./$types').PageData} */
	export let data;

	const brewery = data.brewery;
	const coordinate = [brewery.lng, brewery.lat];
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
	<div class="bg-white p-8 rounded shadow-md w-full max-w-md">
		<h1 class="text-2xl font-bold mb-4">{brewery.name}</h1>
		<form method="post" class="space-y-4">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
				<input
					type="text"
					id="name"
					name="name"
					value={brewery.name}
					class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				/>
			</div>

			<div>
				<label for="address" class="block text-sm font-medium text-gray-700">Address</label>
				<input
					type="text"
					id="address"
					name="address"
					value={brewery.address}
					class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				/>
			</div>

			<div>
				<label for="longitude" class="block text-sm font-medium text-gray-700">Longitude</label>
				<input
					type="text"
					id="longitude"
					name="lng"
					value={brewery.lng}
					class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				/>
			</div>

			<div>
				<label for="latitude" class="block text-sm font-medium text-gray-700">Latitude</label>
				<input
					type="text"
					id="latitude"
					name="lat"
					value={brewery.lat}
					class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				/>
			</div>

			<div>
				<label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
				<input
					type="text"
					id="phone"
					name="phone"
					value={brewery.phone}
					class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
				/>
			</div>

			<div>
				<button
					type="submit"
					class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					Save
				</button>
			</div>
		</form>
	</div>
	<div class="w-full max-w-md h-full">
		<MapLibre
			center={coordinate}
			zoom={15}
			standardControls
			style="https://tiles.openfreemap.org/styles/liberty"
			class="relative h w-full sm:aspect-video sm:max-h-full"
		>
			<DefaultMarker lngLat={coordinate} draggable>
				<Popup offset={[0, -10]}>
					<div class="text-lg font-bold">{brewery.name}</div>
				</Popup>
			</DefaultMarker>
		</MapLibre>
	</div>
</div>
