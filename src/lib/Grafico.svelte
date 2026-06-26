<script>
	import { t } from '$lib/i18n.js';

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

	<div class="chart-header">
		<div class="chart-controls">
			<label for="intervalo-range">
				<span class="controls-label"
					>{t('interval')}: <strong>{intervalo} {t('days')}</strong></span
				>
				<input
					id="intervalo-range"
					type="range"
					min="1"
					max="30"
					bind:value={intervalo}
				/>
			</label>
		</div>

		<div class="chart-hover-panel">
			<div class="hover-row">
				<b>{t('date')}:</b>
				<span>{hover ? formatData(hover.tempo) : '—'}</span>
			</div>
			<div class="hover-row">
				<b>{t('value')}:</b>
				<span class:muted={!hover}
					>{hover ? hover.valor.toFixed(4) : t('hoverHint')}</span
				>
			</div>
		</div>
	</div>

	<div class="chart-body">
	{#if erro && pontos.length === 0 && !carregando}
		<div class="chart-state">
			<p>{t('errorHistory', { from: origem, to: destino })}</p>
		</div>

	{:else if pontos.length > 0}

		<svg viewBox="0 0 {W} {H}" class="chart"
			aria-label={t('chartAria', { from: origem, to: destino })}>

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
					r="12"
					fill="transparent"
					class="hit-area"
					onmouseenter={() => hover = c}
					onmouseleave={() => hover = null}
				/>
				<circle
					cx={c.x}
					cy={c.y}
					r="4"
					fill="white"
					stroke="black"
					stroke-width="2"
					class="dot"
					pointer-events="none"
				/>
			{/each}

		</svg>

	{:else if !carregando}
		<div class="chart-state">
			<p>{t('noData', { from: origem, to: destino })}</p>
		</div>
	{/if}

	{#if carregando}
		<div class="chart-loading-overlay" aria-busy="true">
			<div class="spinner"></div>
			<p>{t('loadingHistory')}</p>
		</div>
	{/if}
	</div>

	<p class="grafico-footer">
		{t('chartFooter', { n: intervalo })}
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
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    min-height: 340px;
}

.chart-header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex-shrink: 0;
}

.chart-controls label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.controls-label {
    font-size: 0.8125rem;
    color: var(--color-text-muted-2);
}

.controls-label strong {
    color: var(--color-accent-soft);
    font-family: 'Roboto Mono', monospace;
}

.chart-controls input[type='range'] {
    width: 100%;
    accent-color: var(--color-accent);
    cursor: pointer;
}

.chart-hover-panel {
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-card-border);
    border-radius: 12px;
    background: var(--color-surface);
    font-size: 0.8125rem;
    color: var(--color-text-muted-2);
    min-height: 3.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.hover-row {
    display: flex;
    gap: 0.5rem;
    line-height: 1.5;
    min-height: 1.25rem;
}

.chart-hover-panel b {
    color: var(--color-accent-light);
    font-weight: 600;
    flex-shrink: 0;
}

.hover-row .muted {
    color: var(--color-text-subtle);
    font-style: italic;
}

.chart-body {
    position: relative;
    flex-shrink: 0;
    height: 340px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chart-loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    background: var(--color-overlay);
    border-radius: 12px;
    color: var(--color-text-muted-2);
    font-size: 0.875rem;
    z-index: 1;
}

.chart {
    width: 100%;
    max-height: 340px;
    display: block;
}

/* GRID */
.grid-line {
    stroke: var(--color-grid);
    stroke-width: 1;
}

.axis-label {
    fill: var(--color-text-subtle);
    font-size: 10px;
    font-family: 'Roboto Mono', monospace;
}

/* PONTOS */
.dot {
    fill: white;
    stroke: black;
    stroke-width: 2;
}

.hit-area {
    cursor: pointer;
}

/* STATES */
.chart-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: var(--color-text-subtle);
    font-size: 0.875rem;
    text-align: center;
    height: 100%;
}

.spinner {
    width: 32px;
    height: 32px;
    border: 2.5px solid rgba(249, 115, 22, 0.15);
    border-top-color: var(--color-accent);
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
    color: var(--color-chart-footer);
    text-align: center;
}
</style>