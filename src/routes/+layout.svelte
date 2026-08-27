<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import SeasonalEffects from '$lib/components/SeasonalEffects.svelte';
	import SiteBanner from '$lib/components/SiteBanner.svelte';
	import { selectedTheme } from '$lib/content/site';
	import { startFirebaseSync } from '$lib/firebase/repository';

	let { children } = $props();
	const isAdmin = $derived(page.url.pathname.startsWith('/admin'));
	startFirebaseSync();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col" data-theme={$selectedTheme}>
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
