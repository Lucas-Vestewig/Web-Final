<script>
	import Conversor from '$lib/Conversor.svelte';
	import Grafico from '$lib/Grafico.svelte';
</script>

<div class="layout">
	<Conversor />

	<div class="grafico-container">
		<Grafico />
	</div>
</div>

<style>
	.layout {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
		justify-content: center;
		padding: 2rem;
	}

	.grafico-container {
		width: 800px;
		min-height: 500px;

		background: linear-gradient(160deg, #1a1a2e 0%, #16213e 100%);
		border: 1px solid rgba(249, 115, 22, 0.18);
		border-radius: 28px;
		padding: 2rem;

		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
	}
</style>