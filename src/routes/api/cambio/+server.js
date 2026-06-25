import { json } from '@sveltejs/kit';

export async function GET({ url }) {
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const date = url.searchParams.get('date');

    let endpoint;

    if (date) {
        endpoint = `https://api.frankfurter.app/${date}?from=${from}&to=${to}`;
    } else {
        endpoint = `https://api.frankfurter.app/latest?from=${from}&to=${to}`;
    }

    const resposta = await fetch(endpoint);
    const dados = await resposta.json();

    return json(dados);
}