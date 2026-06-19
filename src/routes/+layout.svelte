<script>
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<style>
  :global(body) {
    background-color: red;
	color:purple;
  }
</style>

{@render children()}
