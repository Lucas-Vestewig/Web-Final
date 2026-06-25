<script>
	let { origem, destino } = $props();

    const W = 700;
    const H = 340;
    const PAD = { top: 28, right: 20, bottom: 44, left: 64 };

    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    let intervalo = $state(30);

    let pontos = $state([]);
    let carregando = $state(false);
    let erro = $state(false);

    let hover = $state(null);

    function formatData(iso) {
        if (!iso || typeof iso !== "string") return "";
        const p = iso.split("-");
        if (p.length < 3) return iso;
        return `${p[2]}/${p[1]}`;
    }

    async function carregarHistorico(from, to) {
        carregando = true;
        erro = false;

        const novosPontos = [];

        try {
            for (let i = intervalo; i >= 1; i--) {
                const tempDate = new Date();
                tempDate.setDate(tempDate.getDate() - i);

                const data = tempDate.toISOString().split("T")[0];

                let taxa = 1;

                if (from !== to) {
                    const res = await fetch(
                        `/api/cambio?from=${from}&to=${to}&date=${data}`
                    );

                    const dados = await res.json();
                    taxa = dados.rates?.[to];

                    if (taxa == null) continue;
                }

                novosPontos.push({
                    id: novosPontos.length,
                    tempo: data,
                    valor: Number(taxa)
                });
            }

            pontos = novosPontos;
        } catch (e) {
            erro = true;
            pontos = [];
        } finally {
            carregando = false;
        }
    }

    $effect(() => {
        carregarHistorico(origem, destino);
    });

    const coords = $derived.by(() => {
        if (pontos.length === 0) return [];

        const valores = pontos.map(p => p.valor);
        const min = Math.min(...valores);
        const max = Math.max(...valores);
        const range = max - min || 1;

        return pontos.map((p, i) => ({
            ...p,
            x: PAD.left + (i / (pontos.length - 1 || 1)) * chartW,
            y: PAD.top + chartH - ((p.valor - min) / range) * chartH
        }));
    });

    const pathLine = $derived(
        coords.map((c, i) =>
            `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`
        ).join(" ")
    );

    const pathArea = $derived.by(() => {
        if (coords.length < 2) return "";

        const baseY = PAD.top + chartH;

        const line = coords.map((c, i) =>
            `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`
        ).join(" ");

        const last = coords[coords.length - 1];
        const first = coords[0];

        return `${line} L ${last.x.toFixed(1)} ${baseY} L ${first.x.toFixed(1)} ${baseY} Z`;
    });

    const yTicks = $derived.by(() => {
        if (pontos.length === 0) return [];

        const valores = pontos.map(p => p.valor);
        const min = Math.min(...valores);
        const max = Math.max(...valores);

        return Array.from({ length: 6 }, (_, i) => {
            const t = i / 5;

            return {
                y: PAD.top + chartH - t * chartH,
                val: min + t * (max - min)
            };
        });
    });

    const xLabels = $derived.by(() => {
        if (coords.length === 0) return [];

        const step = Math.max(1, Math.floor(coords.length / 5));

        return coords.filter(
            (_, i) => i % step === 0 || i === coords.length - 1
        );
    });
</script>

<div class="chart-wrap">

	<!-- 🎚️ CONTROLE DE INTERVALO -->
	<div class="chart-controls">
		<label>
			Intervalo: {intervalo} dias
			<input
				type="range"
				min="1"
				max="30"
				bind:value={intervalo}
			/>
		</label>
	</div>

	<!-- 🧠 PAINEL DE HOVER -->
	<div class="chart-hover-panel">
		{#if hover}
			<div><b>Data:</b> {formatData(hover.tempo)}</div>
			<div><b>Valor:</b> {hover.valor}</div>
			<div><b>ID:</b> {hover.id}</div>
		{:else}
			<div>Passe o mouse em um ponto do gráfico</div>
		{/if}
	</div>

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

		<svg viewBox="0 0 {W} {H}" class="chart"
			aria-label="Gráfico de câmbio {origem} para {destino}">

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

			<!-- 📉 GRID Y -->
			{#each yTicks as tick}
				<line
					x1={PAD.left}
					y1={tick.y}
					x2={W - PAD.right}
					y2={tick.y}
					class="grid-line"
				/>

				<text
					x={PAD.left - 8}
					y={tick.y + 4}
					class="axis-label y-label"
					text-anchor="end"
				>
					{tick.val.toFixed(4)}
				</text>
			{/each}

			<!-- 📅 X LABELS -->
			{#each xLabels as p}
				<text
					x={p.x}
					y={H - 12}
					class="axis-label x-label"
					text-anchor="middle"
				>
					{formatData(p.tempo)}
				</text>
			{/each}

			<!-- 🟠 ÁREA -->
			{#if pathArea}
				<path d={pathArea} fill="url(#areaGrad)" />
			{/if}

			<!-- 📈 LINHA -->
			{#if pathLine}
				<path
					d={pathLine}
					fill="none"
					stroke="url(#lineGrad)"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			{/if}

			<!-- 📍 PONTOS INTERATIVOS -->
			{#each coords as c}
				<circle
					cx={c.x}
					cy={c.y}
					r="4"
					fill="white"
					stroke="black"
					stroke-width="2"
					onmouseenter={() => hover = c}
					onmouseleave={() => hover = null}
				/>
			{/each}

		</svg>

	{/if}

	<p class="grafico-footer">
		Últimos {intervalo} dias · dados via frankfurter.app
	</p>

</div>

<style>
.grafico {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    padding: 1rem;
}

/* 📊 HEADER */
.grafico-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-shrink: 0;
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

.stat-change.up {
    color: #4ade80;
}

.stat-change.down {
    color: #f87171;
}

/* 🧠 INFO HOVER */
.chart-info {
    padding: 0.5rem 0.75rem;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px;
    font-size: 0.75rem;
    color: #94a3b8;
    flex-shrink: 0;
}

/* 📈 CHART */
.chart-wrap {
    flex: 1;
    min-height: 340px;

    display: flex;
    align-items: center;
    justify-content: center;

    overflow: hidden;
}

.chart {
    width: 100%;
    height: 100%;
    display: block;
}

/* GRID */
.grid-line {
    stroke: rgba(255, 255, 255, 0.06);
    stroke-width: 1;
}

.axis-label {
    fill: #475569;
    font-size: 10px;
    font-family: 'Roboto Mono', monospace;
}

/* PONTOS */
.dot {
    fill: white;
    stroke: black;
    stroke-width: 2;
}

/* STATES */
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
    to {
        transform: rotate(360deg);
    }
}

/* FOOTER */
.grafico-footer {
    font-size: 0.6875rem;
    color: #334155;
    text-align: center;
}
</style>