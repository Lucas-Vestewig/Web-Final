<script>
	import Conversor from '$lib/Conversor.svelte';
	import Grafico from '$lib/Grafico.svelte';

	let origem = $state('USD');
	let destino = $state('BRL');
</script>

<div class="layout">
	<Conversor bind:origem bind:destino />

	<div class="grafico-container">
		<Grafico {origem} {destino} />
	</div>
</div>

<style>
	.layout {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
		justify-content: center;
		padding: 2rem;
		flex-wrap: wrap;
	}

	.grafico-container {
		width: 800px;
		max-width: 100%;
		min-height: 500px;

		background: linear-gradient(160deg, #1a1a2e 0%, #16213e 100%);
		border: 1px solid rgba(249, 115, 22, 0.18);
		border-radius: 28px;
		padding: 2rem;

		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
	}
</style>
