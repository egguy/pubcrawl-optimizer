<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Brewery } from '$lib/types';

	const dispatch = createEventDispatcher<{ toggle: Brewery }>();

	export let brewery: Brewery;
	export let isSelected: boolean = false;

	function toggle() {
		dispatch('toggle', brewery);
		isSelected = !isSelected;
	}
</script>

<div
	class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
	on:mouseenter
	on:mouseleave
>
	<label class="flex items-start space-x-3 cursor-pointer">
		<input
			type="checkbox"
			class="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
			checked={isSelected}
			on:change={toggle}
		/>
		<div class="flex-1">
			<h3 class="font-semibold text-lg">{brewery.name}</h3>
			{#if brewery.address}
				<p class="text-xs text-gray-500 mt-1">{brewery.address}</p>
			{/if}
		</div>
	</label>
</div>
