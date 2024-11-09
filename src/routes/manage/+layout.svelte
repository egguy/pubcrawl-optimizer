<script lang="ts">
	let { data, children } = $props();
	let { supabase } = $derived(data);

	let logout = $derived(async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
		}
	});

	const children_render = $derived(children);
</script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@v10.2.1/ol.css" />

<header class="flex gap-3 p-3">
	<nav>
		<a href="/">Home</a>
	</nav>
	<button onclick={logout}>Logout</button>
</header>

<main class="container mx-auto">
	{@render children_render?.()}
</main>
