<script lang="ts">

	import type { SelectBrewery } from '$lib/server/db/schema';
	import type { MouseEventHandler } from 'svelte/elements';

	interface Props {
		brewery: SelectBrewery;
		isSelected?: boolean;
		toggle: (brewery: SelectBrewery) => void;
		onmouseenter?: MouseEventHandler<HTMLDivElement> | null | undefined;
		onmouseleave?: MouseEventHandler<HTMLDivElement> | null | undefined;
	}

	let { brewery, isSelected = $bindable(false), toggle, onmouseleave, onmouseenter }: Props = $props();

	function onchange() {
		toggle(brewery);
		isSelected = !isSelected;
	}
</script>

<div
	class="rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md"
	role="region"
	{onmouseenter}
	{onmouseleave}
>
	<label class="flex cursor-pointer items-start space-x-3">
		<input
			type="checkbox"
			class="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
			checked={isSelected}
			{onchange}
		/>
		<div class="flex-1">
			<h3 class="text-lg font-semibold">{brewery.name}</h3>
			{#if brewery.address}
				<p class="mt-1 text-xs text-gray-500">{brewery.address}</p>
			{/if}
		</div>
	</label>
</div>
