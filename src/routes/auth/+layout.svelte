<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<header>
	<nav>
		<a href="/">Home</a>
	</nav>
</header>
{@render children?.()}
