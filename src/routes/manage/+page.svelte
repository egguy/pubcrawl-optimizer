<script lang="ts">
	import { invalidate } from '$app/navigation';
	import type { EventHandler } from 'svelte/elements';

	import type { PageData } from './$types';

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
	</tbody>
</table>
