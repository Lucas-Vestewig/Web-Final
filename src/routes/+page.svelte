<script>
	import Conversor from '$lib/Conversor.svelte';
	import Grafico from '$lib/Grafico.svelte';
	import { t } from '$lib/i18n.js';

	let origem = $state('USD');
	let destino = $state('BRL');

	const simbolos = { BRL: 'R$', USD: '$', EUR: '€', GBP: '£' };

	function getSimbol(codigo) {
		return simbolos[codigo] ?? codigo;
	}
</script>

<div class="page">
	<header class="hero">
		<div class="logo-ring">
			{getSimbol(destino)}
		</div>
		<h1>{t('title')} <span class="da-silva">{t('titleSub')}</span></h1>
		<p class="hero-desc">
			{t('heroDescPart1')}
			<strong>Svelte</strong>
			{t('heroDescAnd')}
			<strong>Dart</strong>,
			{t('heroDescPart2')}
			<a href="https://api.frankfurter.app/" target="_blank" rel="noopener noreferrer"
				>frankfurter.app</a
			>
			{t('heroDescPart3')}
		</p>
	</header>

	<div class="layout">
		<Conversor bind:origem bind:destino />

		<div class="grafico-container">
			<Grafico {origem} {destino} />
		</div>
	</div>
</div>

<style>
	.page {
		width: 100%;
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem 1.25rem 2.5rem;
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		width: 100%;
		margin-bottom: 2.5rem;
		gap: 0.875rem;
	}

	.logo-ring {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: linear-gradient(135deg, #e8690e, #f2e862f4);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.8rem;
		font-weight: 800;
		color: #ffffff;
		box-shadow: 0 0 28px rgba(249, 115, 22, 0.45), 0 0 0 6px rgba(249, 115, 22, 0.12);
	}

	h1 {
		font-size: 2rem;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.03em;
		background: var(--color-title-gradient);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		transition: background 0.3s ease;
	}

	.da-silva {
		display: block;
		font-size: 0.875rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		background: var(--color-title-sub-gradient);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		opacity: 0.85;
		margin-top: 0.1rem;
		transition: background 0.3s ease;
	}

	.hero-desc {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		line-height: 1.65;
		max-width: 520px;
	}

	.hero-desc strong {
		color: var(--color-hero-strong);
		font-weight: 500;
	}

	.hero-desc a {
		color: var(--color-accent-light);
		text-decoration: none;
		border-bottom: 1px solid rgba(251, 146, 60, 0.3);
		transition: color 0.2s;
	}

	.hero-desc a:hover {
		color: var(--color-link-hover);
	}

	.layout {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
		justify-content: center;
		flex-wrap: wrap;
	}

	.grafico-container {
		width: 800px;
		max-width: 100%;
		min-height: 500px;
		background: var(--color-card-bg);
		border: 1px solid var(--color-card-border);
		border-radius: 28px;
		padding: 2rem;
		box-shadow: var(--color-card-shadow);
		transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
	}
</style>
