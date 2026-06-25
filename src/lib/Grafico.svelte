<script>
	let { origem, destino } = $props();

	const DIAS = 30;
	const W = 700;
	const H = 340;
	const PAD = { top: 28, right: 20, bottom: 44, left: 64 };
	const chartW = W - PAD.left - PAD.right;
	const chartH = H - PAD.top - PAD.bottom;

	let pontos = $state([]);
	let carregando = $state(false);
	let erro = $state(false);

	function formatData(iso) {
		const [y, m, d] = iso.split('-');
		return `${d}/${m}`;
	}

	async function carregarHistorico(from, to) {
		carregando = true;
		erro = false;
		const novosPontos = [];

		try {
			for (let i = DIAS; i >= 1; i--) {
				const tempDate = new Date();
				tempDate.setDate(tempDate.getDate() - i);
				const data = tempDate.toLocaleDateString('sv-SE');

				if (from === to) {
					novosPontos.push({ data, taxa: 1 });
					continue;
				}

				const res = await fetch(`/api/cambio?from=${from}&to=${to}&date=${data}`);
				const dados = await res.json();
				const taxa = dados.rates?.[to];
				if (taxa != null) {
					novosPontos.push({ data, taxa });
				}
			}
			pontos = novosPontos;
		} catch {
			erro = true;
			pontos = [];
		} finally {
			carregando = false;
		}
	}

	const escala = $derived.by(() => {
		if (pontos.length === 0) return null;
		const rates = pontos.map((p) => p.taxa);
		const min = Math.min(...rates);
		const max = Math.max(...rates);
		const padding = (max - min) * 0.08 || max * 0.01 || 0.01;
		return { min: min - padding, max: max + padding };
	});

	const coords = $derived.by(() => {
		if (!escala || pontos.length === 0) return [];
		const { min, max } = escala;
		const range = max - min || 1;
		return pontos.map((p, i) => ({
			x: PAD.left + (pontos.length === 1 ? chartW / 2 : (i / (pontos.length - 1)) * chartW),
			y: PAD.top + chartH - ((p.taxa - min) / range) * chartH,
			...p
		}));
	});

	const pathLine = $derived(
		coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
	);

	const pathArea = $derived.by(() => {
		if (coords.length < 2) return '';
		const baseY = PAD.top + chartH;
		const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
		const last = coords[coords.length - 1];
		const first = coords[0];
		return `${line} L ${last.x.toFixed(1)} ${baseY} L ${first.x.toFixed(1)} ${baseY} Z`;
	});

	const yTicks = $derived.by(() => {
		if (!escala) return [];
		const { min, max } = escala;
		return [0, 0.25, 0.5, 0.75, 1].map((t) => ({
			y: PAD.top + chartH - t * chartH,
			val: min + t * (max - min)
		}));
	});

	const xLabels = $derived.by(() => {
		if (coords.length === 0) return [];
		const step = Math.max(1, Math.floor(coords.length / 5));
		return coords.filter((_, i) => i % step === 0 || i === coords.length - 1);
	});

	const ultimaTaxa = $derived(pontos.length > 0 ? pontos[pontos.length - 1].taxa : null);
	const variacao = $derived.by(() => {
		if (pontos.length < 2) return null;
		const first = pontos[0].taxa;
		const last = pontos[pontos.length - 1].taxa;
		return ((last - first) / first) * 100;
	});

	$effect(() => {
		const from = origem;
		const to = destino;
		carregarHistorico(from, to);
	});
</script>

<div class="grafico">
	<header class="grafico-header">
		<div>
			<p class="grafico-label">Histórico de câmbio</p>
			<h2 class="grafico-title">1 {origem} → {destino}</h2>
		</div>
		{#if ultimaTaxa !== null && !carregando}
			<div class="grafico-stats">
				<span class="stat-value">{ultimaTaxa.toFixed(4)}</span>
				{#if variacao !== null}
					<span class="stat-change" class:up={variacao >= 0} class:down={variacao < 0}>
						{variacao >= 0 ? '+' : ''}{variacao.toFixed(2)}% em {DIAS} dias
					</span>
				{/if}
			</div>
		{/if}
	</header>

	<div class="chart-wrap">
		{#if carregando}
			<div class="chart-state">
				<div class="spinner"></div>
				<p>Carregando histórico…</p>
			</div>
		{:else if erro || pontos.length === 0}
			<div class="chart-state">
				<p>Não foi possível carregar o histórico para {origem} → {destino}.</p>
			</div>
		{:else}
			<svg viewBox="0 0 {W} {H}" class="chart" aria-label="Gráfico de câmbio {origem} para {destino}">
				<defs>
					<linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#f97316" stop-opacity="0.35" />
						<stop offset="100%" stop-color="#f97316" stop-opacity="0" />
					</linearGradient>
					<linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stop-color="#fdba74" />
						<stop offset="100%" stop-color="#f97316" />
					</linearGradient>
				</defs>

				{#each yTicks as tick}
					<line
						x1={PAD.left}
						y1={tick.y}
						x2={W - PAD.right}
						y2={tick.y}
						class="grid-line"
					/>
					<text x={PAD.left - 8} y={tick.y + 4} class="axis-label y-label" text-anchor="end">
						{tick.val.toFixed(4)}
					</text>
				{/each}

				{#each xLabels as p}
					<text x={p.x} y={H - 12} class="axis-label x-label" text-anchor="middle">
						{formatData(p.data)}
					</text>
				{/each}

				{#if pathArea}
					<path d={pathArea} fill="url(#areaGrad)" />
				{/if}

				{#if pathLine}
					<path d={pathLine} fill="none" stroke="url(#lineGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
				{/if}

				{#each coords as p, i}
					{#if i === coords.length - 1}
						<circle cx={p.x} cy={p.y} r="5" class="dot" />
					{/if}
				{/each}
			</svg>
		{/if}
	</div>

	<p class="grafico-footer">Últimos {DIAS} dias · dados via frankfurter.app</p>
</div>

<style>
	.grafico {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		height: 100%;
	}

	.grafico-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.grafico-label {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		color: #fb923c;
		opacity: 0.65;
		margin-bottom: 0.25rem;
	}

	.grafico-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #e2e8f0;
		letter-spacing: -0.02em;
	}

	.grafico-stats {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.2rem;
	}

	.stat-value {
		font-family: 'Roboto Mono', monospace;
		font-size: 1.125rem;
		font-weight: 600;
		color: #fdba74;
	}

	.stat-change {
		font-size: 0.75rem;
		font-weight: 500;
		font-family: 'Roboto Mono', monospace;
	}

	.stat-change.up { color: #4ade80; }
	.stat-change.down { color: #f87171; }

	.chart-wrap {
		flex: 1;
		min-height: 340px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.chart {
		width: 100%;
		height: auto;
		display: block;
	}

	.grid-line {
		stroke: rgba(255, 255, 255, 0.06);
		stroke-width: 1;
	}

	.axis-label {
		fill: #475569;
		font-size: 10px;
		font-family: 'Roboto Mono', monospace;
	}

	.dot {
		fill: #f97316;
		stroke: #1a1a2e;
		stroke-width: 2;
	}

	.chart-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		color: #475569;
		font-size: 0.875rem;
		text-align: center;
		min-height: 280px;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 2.5px solid rgba(249, 115, 22, 0.15);
		border-top-color: #f97316;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.grafico-footer {
		font-size: 0.6875rem;
		color: #334155;
		text-align: center;
	}
</style>
