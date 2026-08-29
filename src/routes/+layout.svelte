<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import SeasonalEffects from '$lib/components/SeasonalEffects.svelte';
	import SiteBanner from '$lib/components/SiteBanner.svelte';
	import { cursorSettings, selectedTheme } from '$lib/content/site';
	import { pageContent, type PageContent } from '$lib/content/page-content';
	import { startFirebaseSync } from '$lib/firebase/repository';

	let { children } = $props();
	const isAdmin = $derived(page.url.pathname.startsWith('/admin'));
	const isBuilderPreview = page.url.searchParams.get('builder') === '1';
	let builderInspect = $state(true);

	if (!isBuilderPreview) startFirebaseSync();

	onMount(() => {
		if (!isBuilderPreview || window.parent === window) return;

		function focusSection(sectionId: string) {
			document
				.querySelectorAll('[data-builder-selected]')
				.forEach((element) => element.removeAttribute('data-builder-selected'));
			const section = document.querySelector<HTMLElement>(
				`[data-content-section="${sectionId}"]`
			);
			if (!section) return;
			section.setAttribute('data-builder-selected', '');
			section.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}

		function receive(event: MessageEvent) {
			if (event.origin !== window.location.origin || event.source !== window.parent) return;
			if (event.data?.type === 'ashleigh:preview-content') {
				pageContent.set(event.data.content as PageContent);
			}
			if (event.data?.type === 'ashleigh:preview-focus') {
				focusSection(String(event.data.sectionId ?? ''));
			}
			if (event.data?.type === 'ashleigh:preview-inspect') {
				builderInspect = Boolean(event.data.enabled);
			}
		}

		function inspectClick(event: MouseEvent) {
			if (!builderInspect) return;
			const target = event.target as HTMLElement;
			const section = target.closest<HTMLElement>('[data-content-section]');
			if (!section) return;
			event.preventDefault();
			event.stopPropagation();
			window.parent.postMessage(
				{
					type: 'ashleigh:preview-section',
					sectionId: section.dataset.contentSection
				},
				window.location.origin
			);
			focusSection(section.dataset.contentSection ?? '');
		}

		window.addEventListener('message', receive);
		document.addEventListener('click', inspectClick, true);
		window.parent.postMessage({ type: 'ashleigh:preview-ready' }, window.location.origin);

		return () => {
			window.removeEventListener('message', receive);
			document.removeEventListener('click', inspectClick, true);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div
	class="flex min-h-screen flex-col"
	class:builder-preview={isBuilderPreview}
	class:builder-inspect={isBuilderPreview && builderInspect}
	data-theme={$selectedTheme}
	data-site-cursor={!isAdmin ? $cursorSettings.cursor : undefined}
>
	{#if !isAdmin}
		<SeasonalEffects />
		<SiteBanner />
		<Header />
	{/if}
	<main class="flex-1">
		{@render children()}
	</main>
	{#if !isAdmin}<Footer />{/if}
</div>

<style>
	:global(.builder-preview [data-content-section]) {
		position: relative;
	}

	:global(.builder-inspect [data-content-section]) {
		outline: 2px dashed color-mix(in srgb, var(--color-coral) 65%, transparent);
		outline-offset: -2px;
		cursor: crosshair;
		transition:
			outline-color 140ms ease,
			filter 140ms ease;
	}

	:global(.builder-inspect [data-content-section]::before) {
		content: attr(data-content-label);
		position: absolute;
		z-index: 100;
		top: 8px;
		left: 8px;
		padding: 5px 9px;
		border-radius: 999px;
		background: var(--color-ink);
		color: var(--color-paper);
		font: 600 10px/1.2 system-ui, sans-serif;
		letter-spacing: 0.04em;
		pointer-events: none;
	}

	:global(.builder-inspect [data-content-section]:hover),
	:global(.builder-preview [data-builder-selected]) {
		outline: 4px solid var(--color-coral);
		outline-offset: -4px;
		filter: saturate(1.08);
	}

	:global(.builder-inspect a),
	:global(.builder-inspect button) {
		cursor: crosshair;
	}

	:global(.builder-inspect [data-builder-media]) {
		overflow: visible;
		outline: 2px solid color-mix(in srgb, var(--color-teal) 65%, transparent);
		outline-offset: -2px;
	}

	:global(.builder-inspect [data-builder-media]::after) {
		content: attr(data-builder-media);
		position: absolute;
		z-index: 110;
		right: 8px;
		bottom: 8px;
		max-width: calc(100% - 16px);
		padding: 6px 9px;
		border-radius: 8px;
		background: var(--color-teal);
		color: var(--color-paper);
		font: 600 9px/1.3 system-ui, sans-serif;
		opacity: 0;
		pointer-events: none;
		transition: opacity 120ms ease;
	}

	:global(.builder-inspect [data-builder-media]:hover::after) {
		opacity: 1;
	}
</style>
