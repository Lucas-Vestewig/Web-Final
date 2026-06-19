<script>
	const moedas = [
		{ codigo: 'BRL', nome: 'Brasil (BRL)' },
		{ codigo: 'USD', nome: 'EUA (USD)' },
		{ codigo: 'EUR', nome: 'Euro (EUR)' },
		{ codigo: 'GBP', nome: 'Libra (GBP)' }
	];

	let valor = $state(1);
	let origem = $state('USD');
	let destino = $state('BRL');
	let resultado = $state(null);
	let resultado2 = $state(null);

	async function converter() {
		if (origem === destino) {
			resultado = Number(valor);
			resultado2 = 1;
			return;
		}

		try {
			const resposta = await fetch(`/api/cambio?from=${origem}&to=${destino}`);
			const dados = await resposta.json();
			const taxa = dados.rates?.[destino];

			if (!taxa) {
				resultado = null;
				resultado2 = null;
				return;
			}

			resultado = Number(valor) * taxa;
			resultado2 = taxa;
		} catch {
			resultado = null;
			resultado2 = null;
		}
	}

	function inverter() {
		const temp = origem;
		origem = destino;
		destino = temp;
	}

	$effect(() => {
		valor;
		origem;
		destino;
		converter();
	});
</script>

<h1>converte cambio da silva</h1>
<p>projeto web svelte + dart</p>
<p>
	API:
	<a href="https://api.frankfurter.app/" target="_blank" rel="noopener noreferrer">
		https://api.frankfurter.app/
	</a>
</p>

<input type="number" bind:value={valor} />

<button onclick={inverter}>inverte</button>

<select bind:value={origem}>
	{#each moedas as moeda}
		<option value={moeda.codigo}>{moeda.nome}</option>
	{/each}
</select>

<select bind:value={destino}>
	{#each moedas as moeda}
		<option value={moeda.codigo}>{moeda.nome}</option>
	{/each}
</select>

{#if resultado !== null}
	<p>{valor} {origem} = {resultado.toFixed(2)} {destino}</p>
{/if}

{#if resultado2 !== null}
	<p>1 {origem} = {resultado2.toFixed(2)} {destino}</p>
{/if}
