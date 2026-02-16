<script lang="ts">
	import knight_helmet from '$lib/assets/knight_helmet.svg';
	import '$lib/i18n';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={knight_helmet} />
</svelte:head>

{@render children()}
