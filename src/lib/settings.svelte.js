export const settings = $state({
	theme: 'dark',
	lang: 'pt'
});

export function toggleTheme() {
	settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
}

export function toggleLang() {
	settings.lang = settings.lang === 'pt' ? 'en' : 'pt';
}

export function initSettings() {
	if (typeof localStorage === 'undefined') return;

	const savedTheme = localStorage.getItem('theme');
	const savedLang = localStorage.getItem('lang');

	if (savedTheme === 'light' || savedTheme === 'dark') settings.theme = savedTheme;
	if (savedLang === 'pt' || savedLang === 'en') settings.lang = savedLang;
}

export function persistSettings() {
	if (typeof localStorage === 'undefined') return;

	localStorage.setItem('theme', settings.theme);
	localStorage.setItem('lang', settings.lang);
}
