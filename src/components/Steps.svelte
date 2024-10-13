<script lang="ts">
	import type { BrewerySteps } from '$lib/types';

	export let steps: BrewerySteps[] = [];
</script>

<div class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
	<p>Steps</p>
	<ul class="">
		{#each steps as step}
			<li>
				{step.brewery.name} - {step.step.duration}
			</li>
		{/each}
	</ul>
</div>
