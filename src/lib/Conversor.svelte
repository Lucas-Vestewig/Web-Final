<script>
	let { origem = $bindable('USD'), destino = $bindable('BRL') } = $props();

	const moedas = [
		{ codigo: 'BRL', nome: 'Real Brasileiro', simbolo: 'R$' },
		{ codigo: 'USD', nome: 'Dólar Americano', simbolo: '$' },
		{ codigo: 'EUR', nome: 'Euro', simbolo: '€' },
		{ codigo: 'GBP', nome: 'Libra Esterlina', simbolo: '£' }
	];

	let valor = $state(1);
	let resultado = $state(null);
	let resultado2 = $state(null);
	let carregando = $state(false);

	function getSimbol(codigo) {
		return moedas.find(m => m.codigo === codigo)?.simbolo ?? codigo;
	}

	async function converter() {
		if (origem === destino) {
			resultado = Number(valor);
			resultado2 = 1;
			return;
		}
		carregando = true;
		try {
			const resposta = await fetch(`/api/cambio?from=${origem}&to=${destino}`);
			const dados = await resposta.json();
			const taxa = dados.rates?.[destino];
			if (!taxa) { resultado = null; resultado2 = null; return; }
			resultado = Number(valor) * taxa;
			resultado2 = taxa;
		} catch {
			resultado = null;
			resultado2 = null;
		} finally {
			carregando = false;
		}
	}

	function inverter() {
		const temp = origem;
		origem = destino;
		destino = temp;
	}

	$effect(() => { valor; origem; destino; converter(); });
</script>
<!-- Hero / Título -->
	<header class="hero">
		<div class="logo-ring">
  			{getSimbol(destino)}
		</div>
		<h1>Converte Câmbio <span class="da-silva">da Silva</span></h1>
		<p class="hero-desc">
			Projeto web construído com <strong>Svelte</strong> e <strong>Dart</strong>,
			consumindo a API pública
			<a href="https://api.frankfurter.app/" target="_blank" rel="noopener noreferrer">frankfurter.app</a>
			para cotações em tempo real.
		</p>
	</header>

	<!-- Card conversor -->
	<div class="card">

		<p class="card-instruction">Digite o valor e escolha as moedas para converter.</p>

		<!-- Valor -->
		<div class="field">
			<label for="valor">Valor</label>
			<div class="input-wrap">
				<span class="sym">{getSimbol(origem)}</span>
				<input id="valor" type="number" bind:value={valor} min="0" step="any" />
				<span class="cod">{origem}</span>
			</div>
		</div>

		<!-- Moedas -->
		<div class="currencies">
			<div class="field">
				<label for="origem">De</label>
				<div class="sel-wrap">
					<select id="origem" bind:value={origem}>
						{#each moedas as m}
							<option value={m.codigo}>{m.simbolo} {m.codigo} — {m.nome}</option>
						{/each}
					</select>
					<svg class="arr" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
				</div>
			</div>

			<button class="btn-inv" onclick={inverter} aria-label="Inverter moedas">
				<svg viewBox="0 0 24 24" fill="none"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</button>

			<div class="field">
				<label for="destino">Para</label>
				<div class="sel-wrap">
					<select id="destino" bind:value={destino}>
						{#each moedas as m}
							<option value={m.codigo}>{m.simbolo} {m.codigo} — {m.nome}</option>
						{/each}
					</select>
					<svg class="arr" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
				</div>
			</div>
		</div>

		<!-- Resultado -->
		<div class="result-block" class:active={resultado !== null}>
			{#if carregando}
				<div class="spinner"></div>
			{:else if resultado !== null}
				<div class="conversion-display">
					<div class="from-line">
						<span class="from-val">{getSimbol(origem)} {Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
						<span class="from-label">{origem}</span>
					</div>
					<div class="arrow-line">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
							<path d="M12 5v14M5 12l7 7 7-7" stroke="url(#g1)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
							<defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a78bfa"/><stop offset="100%" stop-color="#60a5fa"/></linearGradient></defs>
						</svg>
					</div>
					<div class="to-line">
						<span class="to-val">{getSimbol(destino)} {resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
						<span class="to-label">{destino}</span>
					</div>
				</div>
			{:else}
				<p class="placeholder">Preencha o valor acima para ver a conversão</p>
			{/if}
		</div>

		<!-- Cotação atual -->
		{#if resultado2 !== null && !carregando}
			<div class="quote-footer">
				<span class="quote-label">Cotação atual</span>
				<span class="quote-value">1 {origem} = <strong>{resultado2.toFixed(4)}</strong> {destino}</span>
			</div>
		{/if}

	</div>
	
<style>
	main {
		width: 100%;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2.5rem 1.25rem;
	}

	/* Hero */
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		margin-bottom: 2rem;
		gap: 0.875rem;
		max-width: 440px;
	}

	.logo-ring {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: linear-gradient(135deg, #e8690e, #f2e862f4);
		display: flex;
		align-items: center;
		font-size: 1.8rem;      /* ← adiciona isso */
  		font-weight: 8000;       /* ← e isso */
		justify-content: center;
		color: #ffffff;
		box-shadow: 0 0 28px rgba(249,115,22,0.45), 0 0 0 6px rgba(249,115,22,0.12);
	}

	h1 {
		font-size: 2rem;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.03em;
		background: linear-gradient(100deg, #faff9c 0%, #fdba74 50%, #f97316 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.da-silva {
		display: block;
		font-size: 0.875rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		background: linear-gradient(90deg, #f97316, #faff9c);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		opacity: 0.75;
		margin-top: 0.1rem;
	}

	.hero-desc {
		font-size: 0.8125rem;
		color: #64748b;
		line-height: 1.65;
	}

	.hero-desc strong { color: #94a3b8; font-weight: 500; }

	.hero-desc a {
		color: #fb923c;
		text-decoration: none;
		border-bottom: 1px solid rgba(251,146,60,0.3);
		transition: color 0.2s;
	}

	.hero-desc a:hover { color: #ffffff; }

	/* Card */
	.card {
		background: linear-gradient(160deg, #1a1a2e 0%, #16213e 100%);
		border: 1px solid rgba(249,115,22,0.18);
		border-radius: 28px;
		padding: 2rem 1.75rem;
		width: 100%;
		max-width: 440px;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(249,115,22,0.04);
	}

	.card-instruction {
		font-size: 0.8125rem;
		color: #475569;
		text-align: center;
		line-height: 1.5;
	}

	/* Fields */
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		flex: 1;
		min-width: 0;
	}

	.field label {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #f97316;
	}

	.input-wrap {
		display: flex;
		align-items: center;
		background: rgba(255,255,255,0.04);
		border: 1px solid rgba(249,115,22,0.25);
		border-radius: 16px;
		overflow: hidden;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.input-wrap:focus-within {
		border-color: #f97316;
		box-shadow: 0 0 0 3px rgba(249,115,22,0.15);
	}

	.sym {
		padding: 0 0.75rem;
		font-size: 1rem;
		color: #fb923c;
		font-weight: 600;
		font-family: 'Roboto Mono', monospace;
		border-right: 1px solid rgba(249,115,22,0.18);
		align-self: stretch;
		display: flex;
		align-items: center;
		background: rgba(249,115,22,0.07);
	}

	input[type='number'] {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: #fefff5;
		font-family: 'Roboto Mono', monospace;
		font-size: 1.25rem;
		font-weight: 500;
		padding: 0.875rem;
		/* Remove the native spinner arrows */
		-moz-appearance: textfield;
	}

	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: 1;
		-webkit-color: red;
		
		margin: 0;
	}

	.cod {
		padding: 0 0.875rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: #475569;
		font-family: 'Roboto Mono', monospace;
		letter-spacing: 0.05em;
	}

	/* Currencies */
	.currencies {
		display: flex;
		align-items: flex-end;
		gap: 0.625rem;
	}

	.sel-wrap { position: relative; }

	select {
		width: 100%;
		appearance: none;
		background: rgba(255,255,255,0.04);
		border: 1px solid rgba(255,255,255,0.12);
		border-radius: 14px;
		color: #cbd5e1;
		font-family: 'Roboto', sans-serif;
		font-size: 0.8125rem;
		font-weight: 500;
		padding: 0.75rem 2.25rem 0.75rem 0.875rem;
		cursor: pointer;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	select:focus {
		outline: none;
		border-color: #f97316;
		box-shadow: 0 0 0 3px rgba(249,115,22,0.13);
	}

	select option { background: #1a1a2e; color: #e2e8f0; }

	.arr {
		position: absolute;
		right: 0.625rem;
		top: 50%;
		transform: translateY(-50%);
		width: 15px;
		height: 15px;
		color: #475569;
		pointer-events: none;
	}

	.btn-inv {
		width: 44px;
		height: 44px;
		border-radius: 14px;
		border: 1px solid rgba(249,115,22,0.3);
		background: rgba(249,115,22,0.1);
		color: #fb923c;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s;
		margin-bottom: 1px;
	}

	.btn-inv svg { width: 18px; height: 18px; }

	.btn-inv:hover {
		background: rgba(249,115,22,0.22);
		border-color: #f97316;
		box-shadow: 0 0 14px rgba(249,115,22,0.28);
	}

	.btn-inv:active { transform: scale(0.9); }

	/* Result */
	.result-block {
		background: rgba(255,255,255,0.02);
		border: 1px solid rgba(255,255,255,0.06);
		border-radius: 20px;
		padding: 1.5rem 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 120px;
		transition: border-color 0.3s, background 0.3s;
	}

	.result-block.active {
		border-color: rgba(249,115,22,0.2);
		background: linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(255,255,255,0.03) 100%);
	}

	.conversion-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
	}

	.from-line, .to-line {
		display: flex;
		align-items: baseline;
		gap: 0.625rem;
	}

	.from-val {
		font-family: 'Roboto Mono', monospace;
		font-size: 1.125rem;
		font-weight: 500;
		color: #94a3b8;
	}

	.from-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #475569;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.arrow-line { opacity: 0.7; }

	.to-val {
		font-family: 'Roboto Mono', monospace;
		font-size: 2.125rem;
		font-weight: 700;
		background: linear-gradient(90deg, #ffffff 0%, #fdba74 50%, #f97316 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		line-height: 1;
	}

	.to-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.placeholder {
		font-size: 0.8125rem;
		color: #2d3748;
		font-style: italic;
		text-align: center;
	}

	.spinner {
		width: 28px;
		height: 28px;
		border: 2.5px solid rgba(249,115,22,0.15);
		border-top-color: #f97316;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin { to { transform: rotate(360deg); } }

	/* Cotação */
	.quote-footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		padding-top: 0.5rem;
		border-top: 1px solid rgba(255,255,255,0.05);
	}

	.quote-label {
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		color: #fb923c;
		opacity: 0.65;
	}

	.quote-value {
		font-size: 0.8125rem;
		color: #475569;
		font-family: 'Roboto Mono', monospace;
	}

	.quote-value strong {
		color: #fb923c;
		font-weight: 600;
	}

	/* Responsive */
	@media (max-width: 400px) {
		.card { padding: 1.5rem 1.25rem; border-radius: 22px; }
		h1 { font-size: 1.625rem; }
		.to-val { font-size: 1.75rem; }
		.currencies { flex-wrap: wrap; }
		.btn-inv { width: 100%; border-radius: 12px; order: 3; }
		.field { flex: 1 1 calc(50% - 0.625rem); }
	}
</style>