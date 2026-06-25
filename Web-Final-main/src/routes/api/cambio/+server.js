import { json } from '@sveltejs/kit';

function formatDate(date) {
	return date.toISOString().slice(0, 10);
}

export async function GET({ url }) {
	const from = url.searchParams.get('from');
	const to = url.searchParams.get('to');
	const period = url.searchParams.get('period');

	if (period) {
		const ranges = {
			'1w': 7,
			'1m': 30,
			'1y': 365
		};
		const days = ranges[period] || 7;
		const end = new Date();
		const start = new Date(end);
		start.setDate(end.getDate() - days);

		const resposta = await fetch(`https://api.frankfurter.app/${formatDate(start)}..${formatDate(end)}?from=${from}&to=${to}`);
		const dados = await resposta.json();

		const history = Object.entries(dados.rates || {})
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([date, rateObj]) => ({ date, rate: rateObj[to] ?? null }));

		return json({
			from,
			to,
			period,
			history,
			latest: history.length ? history[history.length - 1].rate : null
		});
	}

	const resposta = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
	const dados = await resposta.json();

	return json(dados);
}
