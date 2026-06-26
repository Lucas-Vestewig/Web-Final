<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Toolbar from '$lib/Toolbar.svelte';
	import {
		settings,
		initSettings,
		persistSettings
	} from '$lib/settings.svelte.js';

	let { children } = $props();

	initSettings();

	$effect(() => {
		document.documentElement.setAttribute('data-theme', settings.theme);
		document.documentElement.lang = settings.lang === 'en' ? 'en' : 'pt-BR';
		persistSettings();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Mono:wght@400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<Toolbar />

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		background-color: var(--color-bg);
		background-image:
			radial-gradient(ellipse at 20% 20%, var(--color-bg-gradient-1) 0%, transparent 60%),
			radial-gradient(ellipse at 80% 80%, var(--color-bg-gradient-2) 0%, transparent 60%);
		background-attachment: fixed;
		color: var(--color-text);
		font-family: 'Roboto', sans-serif;
		min-height: 100vh;
		transition: background-color 0.25s ease, color 0.25s ease;
	}
</style>

{@render children()}
