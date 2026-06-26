import { settings } from './settings.svelte.js';

export const messages = {
	pt: {
		title: 'Converte Câmbio',
		titleSub: 'da Silva',
		heroDescPart1: 'Projeto web construído com',
		heroDescAnd: 'e',
		heroDescPart2: 'consumindo a API pública',
		heroDescPart3: 'para cotações em tempo real.',
		cardInstruction: 'Digite o valor e escolha as moedas para converter.',
		value: 'Valor',
		from: 'De',
		to: 'Para',
		invert: 'Inverter moedas',
		placeholder: 'Preencha o valor acima para ver a conversão',
		currentQuote: 'Cotação atual',
		interval: 'Intervalo',
		days: 'dias',
		date: 'Data',
		hoverHint: 'Passe o mouse em um ponto',
		loadingHistory: 'Carregando histórico…',
		errorHistory: 'Não foi possível carregar o histórico para {from} → {to}.',
		noData: 'Sem dados para {from} → {to}.',
		chartFooter: 'Últimos {n} dias · dados via frankfurter.app',
		chartAria: 'Gráfico de câmbio {from} para {to}',
		themeToLight: 'Ativar modo claro',
		themeToDark: 'Ativar modo escuro',
		langSwitch: 'Mudar idioma',
		currencies: {
			BRL: 'Real Brasileiro',
			USD: 'Dólar Americano',
			EUR: 'Euro',
			GBP: 'Libra Esterlina'
		}
	},
	en: {
		title: 'Currency Converter',
		titleSub: 'Smith',
		heroDescPart1: 'Web project built with',
		heroDescAnd: 'and',
		heroDescPart2: 'using the public API',
		heroDescPart3: 'for real-time exchange rates.',
		cardInstruction: 'Enter an amount and choose currencies to convert.',
		value: 'Amount',
		from: 'From',
		to: 'To',
		invert: 'Swap currencies',
		placeholder: 'Enter a value above to see the conversion',
		currentQuote: 'Current rate',
		interval: 'Range',
		days: 'days',
		date: 'Date',
		hoverHint: 'Hover over a chart point',
		loadingHistory: 'Loading history…',
		errorHistory: 'Could not load history for {from} → {to}.',
		noData: 'No data for {from} → {to}.',
		chartFooter: 'Last {n} days · data via frankfurter.app',
		chartAria: 'Exchange chart {from} to {to}',
		themeToLight: 'Switch to light mode',
		themeToDark: 'Switch to dark mode',
		langSwitch: 'Change language',
		currencies: {
			BRL: 'Brazilian Real',
			USD: 'US Dollar',
			EUR: 'Euro',
			GBP: 'British Pound'
		}
	}
};

export function t(key, params = {}) {
	const bucket = messages[settings.lang] ?? messages.pt;
	let text = bucket[key] ?? messages.pt[key] ?? key;

	if (typeof text !== 'string') return text;

	for (const [name, value] of Object.entries(params)) {
		text = text.replace(`{${name}}`, String(value));
	}

	return text;
}

export function currencyName(code) {
	const bucket = messages[settings.lang] ?? messages.pt;
	return bucket.currencies?.[code] ?? code;
}

export function locale() {
	return settings.lang === 'en' ? 'en-US' : 'pt-BR';
}
