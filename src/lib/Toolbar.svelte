<script>
	import { settings, toggleTheme, toggleLang } from '$lib/settings.svelte.js';
	import { t } from '$lib/i18n.js';
</script>

<div class="toolbar">
	<button
		type="button"
		class="toolbar-btn"
		onclick={toggleTheme}
		aria-label={settings.theme === 'dark' ? t('themeToLight') : t('themeToDark')}
	>
		{#if settings.theme === 'dark'}
			<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" />
				<path
					d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
		{:else}
			<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path
					d="M21 14.5A7.5 7.5 0 0 1 9.5 3 6.5 6.5 0 1 0 21 14.5Z"
					stroke="currentColor"
					stroke-width="2"
					stroke-linejoin="round"
				/>
			</svg>
		{/if}
	</button>

	<button
		type="button"
		class="toolbar-btn lang-btn"
		onclick={toggleLang}
		aria-label={t('langSwitch')}
	>
		{settings.lang === 'pt' ? 'EN' : 'PT'}
	</button>
</div>

<style>
	.toolbar {
		position: fixed;
		top: 1rem;
		right: 1rem;
		display: flex;
		gap: 0.5rem;
		z-index: 100;
	}

	.toolbar-btn {
		width: 42px;
		height: 42px;
		border-radius: 12px;
		border: 1px solid var(--color-toolbar-border);
		background: var(--color-toolbar-bg);
		color: var(--color-accent-light);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(8px);
		transition: background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
	}

	.toolbar-btn svg {
		width: 18px;
		height: 18px;
	}

	.lang-btn {
		font-size: 0.75rem;
		font-weight: 700;
		font-family: 'Roboto Mono', monospace;
		letter-spacing: 0.04em;
	}

	.toolbar-btn:hover {
		border-color: var(--color-accent);
		box-shadow: 0 0 14px rgba(249, 115, 22, 0.2);
	}

	.toolbar-btn:active {
		transform: scale(0.94);
	}
</style>
