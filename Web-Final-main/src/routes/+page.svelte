<script>
	import { onMount } from 'svelte';

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
	let period = $state('1w');
	let history = $state([]);
	let loadingHistory = $state(false);

	const periodOptions = [
		{ value: '1w', label: '1 semana' },
		{ value: '1m', label: '1 mês' },
		{ value: '1y', label: '1 ano' }
	];

	function formatChartDate(date) {
		const [year, month, day] = date.split('-');
		return `${day}/${month}`;
	}

	function reduceHistory(entries, maxPoints) {
		if (entries.length <= maxPoints) return entries;
		const step = Math.ceil(entries.length / maxPoints);
		return entries.filter((_, index) => index % step === 0);
	}

	function getVisibleHistory() {
		return period === '1y' ? reduceHistory(history, 12) : history;
	}

	function getChartPoints() {
		const visible = getVisibleHistory().filter((item) => item.rate != null);
		if (!visible.length) return [];
		const rates = visible.map((item) => item.rate);
		const maxRate = Math.max(...rates);
		const minRate = Math.min(...rates);
		const range = maxRate - minRate || 1;
		return visible.map((item, index) => ({
			x: visible.length === 1 ? 50 : (index / (visible.length - 1)) * 100,
			y: 90 - ((item.rate - minRate) / range) * 70,
			date: item.date,
			rate: item.rate
		}));
	}

	function getChartPath() {
		const points = getChartPoints();
		return points.length ? points.map((point) => `${point.x},${point.y}`).join(' ') : '';
	}

	async function loadHistory() {
		loadingHistory = true;
		try {
			const resposta = await fetch(`/api/cambio?from=${origem}&to=${destino}&period=${period}`);
			const dados = await resposta.json();
			history = dados.history || [];
		} catch {
			history = [];
		} finally {
			loadingHistory = false;
		}
	}

	function setPeriod(value) {
		period = value;
		loadHistory();
	}

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
		converter();
		loadHistory();
	}

	onMount(() => {
		converter();
		loadHistory();
	});

	$effect(() => {
		valor;
		origem;
		destino;
		period;
		converter();
		loadHistory();
	});
</script>

<div class="page-header">
	<div class="brand">
		<span class="brand-icon">₿</span>
		<div>
			<h1>Câmbio da Silva</h1>
			<p class="description">Projeto em Svelte usando a API Frankfurter para conversão de moedas em tempo real.</p>
		</div>
	</div>
</div>

<div class="container">
	<div class="card conversor">
		<h2>Conversor de Moedas</h2>

		<label>Valor</label>
		<input type="number" bind:value={valor} placeholder="100" />

		<div class="moedas">
			<select bind:value={origem}>
				{#each moedas as moeda}
					<option value={moeda.codigo}>{moeda.codigo}</option>
				{/each}
			</select>

			<button class="inverter-btn" on:click={inverter}>⇄</button>

			<select bind:value={destino}>
				{#each moedas as moeda}
					<option value={moeda.codigo}>{moeda.codigo}</option>
				{/each}
			</select>
		</div>

		<button class="converter" on:click={converter}>Converter</button>
		{#if resultado !== null}
			<div class="resultado">
				{resultado.toFixed(2)} {destino}
			</div>
		{/if}
	</div>

	<div class="card grafico">
		<h1>📈 Gráfico de Cotação</h1>
		<div class="periods">
			{#each periodOptions as option}
				<button
					class:selected={period === option.value}
					on:click={() => setPeriod(option.value)}
				>
					{option.label}
				</button>
			{/each}
		</div>
		<div class="chart-area">
			{#if loadingHistory}
				<p class="loading">Carregando dados...</p>
			{:else if history.length === 0}
				<p class="loading">Sem dados para exibir.</p>
			{:else}
				<div class="chart-lines">
					<svg viewBox="0 0 100 100" preserveAspectRatio="none">
						<defs>
							<linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
								<stop offset="0%" stop-color="#f7931a" stop-opacity="0.45" />
								<stop offset="100%" stop-color="#f7931a" stop-opacity="0" />
							</linearGradient>
						</defs>
						<polygon points={"0,90 " + getChartPath() + " 100,90"} class="chart-area-fill" />
						<polyline points={getChartPath()} class="chart-line" />
						{#each getChartPoints() as point}
							<circle cx={point.x} cy={point.y} r="1.4" class="chart-dot" />
						{/each}
					</svg>
				</div>
				<div class="chart-labels">
					{#each getChartPoints() as point}
							<span style:left={point.x + '%'}>{formatChartDate(point.date)}</span>
					{/each}
				</div>
			{/if}
		</div>
		<div class="info">
			<p>Taxa atual</p>
			<p class="taxa">1 {origem} = {resultado2?.toFixed(4) ?? '--'} {destino}</p>
		</div>
	</div>
</div>

<style>
	.page-header {
		width: 100%;
		max-width: 1400px;
		margin-bottom: 30px;
		display: flex;
		align-items: center;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 18px;
	}

	.brand-icon {
		font-size: 30px;
		color: #f7931a;
	}

	h1 {
		font-size: 34px;
		margin: 0;
		color: #ffffff;
	}

	.description {
		margin: 6px 0 0;
		color: #d4d4d4;
		font-size: 15px;
	}

	.container {
		width: 100%;
		max-width: 1400px;
		display: grid;
		grid-template-columns: 400px 1fr;
		gap: 25px;
	}

	.card {
		background: #090b10;
		border: 1px solid #3a2d16;
		border-radius: 20px;
		padding: 30px;
		box-shadow: 0 15px 50px rgba(0, 0, 0, 0.45);
	}

	h2 {
		font-size: 28px;
		margin-bottom: 30px;
		color: #f7a145;
	}

	label {
		display: block;
		margin-bottom: 10px;
		color: #9CA3AF;
	}

	input {
		width: 100%;
		padding: 18px;
		border: 1px solid #3c2a10;
		border-radius: 12px;
		background: #151a22;
		color: white;
		margin-bottom: 25px;
		font-size: 18px;
		transition: border-color 0.3s, background 0.3s;
	}

	input:focus {
		outline: none;
		background: #1f262f;
		border-color: #f7931a;
	}

	.moedas {
		display: flex;
		gap: 15px;
		margin-bottom: 25px;
	}

	select {
		flex: 1;
		padding: 15px;
		background: #151a22;
		border: 1px solid #3c2a10;
		color: white;
		border-radius: 12px;
		font-size: 16px;
		cursor: pointer;
		transition: border-color 0.3s, background 0.3s;
	}

	select:focus {
		outline: none;
		background: #1f262f;
		border-color: #f7931a;
	}

	.inverter-btn {
		width: 55px;
		height: 55px;
		border: none;
		border-radius: 50%;
		background: #1f262f;
		color: #f7931a;
		cursor: pointer;
		font-size: 20px;
		transition: background 0.3s;
	}

	.inverter-btn:hover {
		background: #2c343f;
	}

	.converter {
		width: 100%;
		padding: 18px;
		border: none;
		border-radius: 12px;
		background: #f7931a;
		color: #111;
		font-size: 18px;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.3s;
	}

	.converter:hover {
		background: #d67f13;
	}

	.resultado {
		margin-top: 30px;
		font-size: 42px;
		font-weight: 700;
		color: #f7931a;
	}

	.chart-area {
		height: 430px;
		margin-top: 20px;
		border-radius: 15px;
		background: #0d1119;
		border: 1px solid #3a2d16;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: stretch;
		color: #9ca3af;
		padding: 20px;
	}

	.chart-lines {
		width: 100%;
		flex: 1;
		min-height: 0;
		margin-bottom: 10px;
		position: relative;
	}

	.chart-lines svg {
		width: 100%;
		height: 100%;
	}

	.chart-labels {
		position: relative;
		width: 100%;
		height: 24px;
		margin-top: 12px;
		color: #7c8798;
		font-size: 11px;
	}

	.chart-labels span {
		position: absolute;
		top: 0;
		transform: translateX(-50%);
		white-space: nowrap;
		font-size: 11px;
		color: #7c8798;
	}

	.chart-labels span:first-child {
		left: 0%;
		transform: translateX(0);
	}

	.chart-labels span:last-child {
		left: 100%;
		transform: translateX(-100%);
	}

	.chart-line {
		fill: none;
		stroke: #f7931a;
		stroke-width: 1.2;
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-opacity: 0.95;
	}

	.chart-area-fill {
		fill: url(#lineGradient);
		opacity: 0.5;
	}

	.chart-dot {
		fill: #f7931a;
	}

	.periods {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 10px;
	}

	.periods button {
		padding: 10px 16px;
		border-radius: 999px;
		border: 1px solid #3a2d16;
		background: transparent;
		color: #d4d4d4;
		cursor: pointer;
		transition: background 0.25s, color 0.25s, border-color 0.25s;
	}

	.periods button[selected],
	.periods button.selected {
		background: #f7931a;
		color: #111;
		border-color: #f7931a;
	}

	.chart-bars {
		width: 100%;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 6px;
		list-style: none;
		padding: 0;
		height: 100%;
		margin: 0;
	}

	.chart-bars li {
		flex: 1;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
	}

	.bar {
		width: 100%;
		max-width: 18px;
		background: linear-gradient(180deg, #f7931a 0%, #ffb347 100%);
		border-radius: 999px 999px 0 0;
		display: block;
	}

	.chart-bars small {
		margin-top: 8px;
		font-size: 11px;
		color: #7c8798;
	}

	.loading {
		color: #9ca3af;
		font-size: 15px;
	}

	.info {
		text-align: center;
	}

	.info p:first-child {
		font-size: 16px;
		color: #9ca3af;
		margin-bottom: 15px;
	}

	.taxa {
		font-size: 36px;
		font-weight: 700;
		color: #f7931a;
	}

	@media (max-width: 900px) {
		.container {
			grid-template-columns: 1fr;
		}
		.chart {
			height: 400px;
		}
	}
</style>
