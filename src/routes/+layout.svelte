<script>
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />
</svelte:head>

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}
 
	:global(body) {
		background-color: #0d0d1a;
		background-image:
			radial-gradient(ellipse at 20% 20%, rgba(173, 25, 214, 0.08) 0%, transparent 60%),
			radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.07) 0%, transparent 60%);
		background-attachment: fixed;
		color: #e2e8f0;
		font-family: 'Roboto', sans-serif;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>

{@render children()}
