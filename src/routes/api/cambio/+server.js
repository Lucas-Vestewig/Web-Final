import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const from = url.searchParams.get('from');
	const to = url.searchParams.get('to');

	const resposta = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
	const dados = await resposta.json();

	return json(dados);
}
