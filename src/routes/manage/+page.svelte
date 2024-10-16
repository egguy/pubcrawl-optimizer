<script lang="ts">
	import { invalidate } from '$app/navigation';
	import type { EventHandler } from 'svelte/elements';

	import type { PageData } from './$types';
	import { DefaultMarker, MapLibre, Popup } from 'svelte-maplibre';

	let name: string;
	let address: string;
	let coords = {
		lng: undefined,
		lat: undefined
	};
	let lng: number;
	let lat: number;
	let phone: string;

	export let data: PageData;
	$: ({ breweries, supabase, user } = data);

	let handleSubmit: EventHandler<SubmitEvent, HTMLFormElement>;
	$: handleSubmit = async (evt) => {
		evt.preventDefault();
		if (!evt.target) return;

		const form = evt.target as HTMLFormElement;

		const note = (new FormData(form).get('note') ?? '') as string;
		if (!note) return;

		const { error } = await supabase.from('notes').insert({ note });
		if (error) console.error(error);

		invalidate('supabase:db:notes');
		form.reset();
	};

	function addMarker(e: CustomEvent<MapMouseEvent>) {
		if (!lng && !lat) {
			coords.lng = e.detail.lngLat.lng;
			coords.lat = e.detail.lngLat.lat;
		}
	}
</script>

<svelte:head>
	<title>DB Management</title>
</svelte:head>

<h1>DB</h1>
{breweries.length}

<table class="w-full text-left table-auto min-w-max text-slate-800">
	<thead>
		<tr class="text-slate-500 border-b border-slate-300 bg-slate-50">
			<th>Name</th>
			<th>Address</th>
			<th>Longitude</th>
			<th>Latitude</th>
			<th>Phone</th>
		</tr>
	</thead>
	<tbody>
		{#each breweries as brewery}
			<tr class="p-4 border-b border-slate-200">
				<td>
					<a href={`/manage/${brewery.id}`} class="text-blue-500 hover:underline">
						{brewery.name}
					</a>
				</td>
				<td>{brewery.address}</td>
				<td>{brewery.lng}</td>
				<td>{brewery.lat}</td>
				<td>{brewery.phone}</td>
			</tr>
		{/each}
		<tr>
			<td>
				<input type="text" bind:value={name} />
			</td>
			<td>
				<input type="text" bind:value={address} />
			</td>
			<td>
				<input type="text" bind:value={coords.lng} />
			</td>
			<td>
				<input type="text" bind:value={coords.lat} />
			</td>
			<td>
				<input type="text" bind:value={phone} />
			</td>
		</tr>
	</tbody>
</table>
<button
	class="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
	on:click={handleSubmit}>Add</button
>
<MapLibre
	center={[151.15940896977347, -33.9055456778862]}
	zoom={15}
	standardControls
	style="https://tiles.openfreemap.org/styles/liberty"
	class="relative h w-full sm:aspect-video sm:max-h-full"
	on:click={addMarker}
>
	{#if coords.lng && coords.lat}
		<DefaultMarker bind:lngLat={coords} draggable>
			<Popup offset={[0, -10]}>
				<div class="text-lg font-bold">New Marker</div>
			</Popup>
		</DefaultMarker>
	{/if}

	{#each breweries as brewery}
		{#if brewery.lng && brewery.lat}
			<DefaultMarker lngLat={[brewery.lng, brewery.lat]}>
				<Popup offset={[0, -10]}>
					<div class="text-lg font-bold">{brewery.name}</div>
				</Popup>
			</DefaultMarker>
		{/if}
	{/each}
</MapLibre>
