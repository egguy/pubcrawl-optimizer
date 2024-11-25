<script lang="ts">
	const  brewery: {
		name: string;
		type: string;
		rating: number;
		address: string;
	} = $props();
</script>

<div class="popup-content">
	<h3>${brewery.name}</h3>
	<p>${brewery.type}</p>
	<p>Rating: ${brewery.rating}/5</p>
	<p>${brewery.address}</p>
</div>
