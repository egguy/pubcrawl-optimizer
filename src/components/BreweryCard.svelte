<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';
	import Icon from '@iconify/svelte';
	import { displayTags } from '$lib/tags';
	import type { BreweryTags } from '$lib/types';

	interface Props {
		brewery: BreweryTags;
		isSelected?: boolean;
		toggle: (brewery: BreweryTags) => void;
		onmouseenter?: MouseEventHandler<HTMLDivElement> | null | undefined;
		onmouseleave?: MouseEventHandler<HTMLDivElement> | null | undefined;
	}

	let {
		brewery,
		isSelected = $bindable(false),
		toggle,
		onmouseleave,
		onmouseenter
	}: Props = $props();

	function onchange() {
		toggle(brewery);
		isSelected = !isSelected;
	}
</script>

<div
	class="rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md"
	role="region"
	aria-label="Brewery selection card"
	{onmouseenter}
	{onmouseleave}
>
	<label class="flex cursor-pointer items-start space-x-3">
		<input
			type="checkbox"
			class="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
			checked={isSelected}
			aria-label="Select brewery"
			{onchange}
		/>
		<div class="flex-1">
			<h3 class="text-lg font-semibold">{brewery.name}</h3>
			{#if brewery.tags && brewery.tags.length > 0}
				<ul class="mt-1 flex space-x-2" aria-label="Brewery tags">
					{#each brewery.tags as tag}
						{#if displayTags.has(tag.key)}
							<li class="text-gray-500">
								<span role="img" aria-label={displayTags.get(tag.key)?.name ?? ''}>
									<Icon icon={displayTags.get(tag.key)?.icon ?? ''} />
								</span>
							</li>
						{/if}
					{/each}
				</ul>
			{/if}
			{#if brewery.address}
				<p class="mt-1 text-xs text-gray-500">{brewery.address}</p>
			{/if}
		</div>
	</label>
</div>
