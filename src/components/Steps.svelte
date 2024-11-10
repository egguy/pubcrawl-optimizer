<script lang="ts">
	import type { BrewerySteps } from '$lib/types';

	interface Props {
		steps?: BrewerySteps[];
	}

	let { steps = [] }: Props = $props();
</script>

<div class="rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md">
	<p>Steps</p>
	<ul class="">
		{#each steps as step}
			<li>
				{step.brewery?.name} - {step.step.duration}
			</li>
		{/each}
	</ul>
</div>
