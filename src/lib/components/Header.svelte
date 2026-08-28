<script lang="ts">
	import { page } from '$app/state';
	import { pageContent } from '$lib/content/page-content';
	import { siteNavigation } from '$lib/content/navigation';
	import { slide } from 'svelte/transition';
	import WavyEdge from './WavyEdge.svelte';

	const colors = ['nav-coral', 'nav-teal', 'nav-blog', 'nav-marigold', 'nav-violet'];
	const global = $derived($pageContent.global);
	const links = siteNavigation.map((link, index) => ({
		...link,
		color: colors[index] ?? 'nav-coral'
	}));

	let menuOpen = $state(false);

	const isActive = (href: string) => page.url.pathname.startsWith(href);
</script>

<header class="sticky top-0 z-50">
	<div class="grid h-1 grid-cols-4" aria-hidden="true">
		<span class="bg-coral"></span>
		<span class="bg-marigold"></span>
		<span class="bg-teal"></span>
		<span class="bg-violet"></span>
	</div>
	<div class="bg-paper">
		<div class="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 md:h-24 md:px-8">
			<a
				href="/"
				class="group flex items-baseline gap-1.5 tracking-tight"
				onclick={() => (menuOpen = false)}
			>
				<span class="font-display text-2xl md:text-3xl">{global.firstName}</span>
				<span
					class="font-cursive -rotate-3 text-4xl leading-none text-coral transition-transform group-hover:rotate-1 md:text-5xl"
					>{global.lastName}</span
				>
			</a>

			<nav class="hidden items-center gap-1.5 md:flex" aria-label="Primary">
				{#each links as link (link.href)}
					<a
						href={link.href}
						class="nav-cut {link.color} px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] transition-transform hover:-translate-y-1
							{isActive(link.href) ? 'is-active text-paper' : 'text-ink'}"
					>
						{link.label}
					</a>
				{/each}
			</nav>

			<button
				class="nav-cut flex h-10 w-10 flex-col items-center justify-center gap-1.5 bg-marigold md:hidden"
				onclick={() => (menuOpen = !menuOpen)}
				aria-expanded={menuOpen}
				aria-label="Toggle menu"
			>
				<span
					class="block h-0.5 w-5 bg-ink transition-transform duration-200 {menuOpen
						? 'translate-y-[4px] rotate-45'
						: ''}"
				></span>
				<span
					class="block h-0.5 w-5 bg-ink transition-opacity duration-200 {menuOpen ? 'opacity-0' : ''}"
				></span>
				<span
					class="block h-0.5 w-5 bg-ink transition-transform duration-200 {menuOpen
						? '-translate-y-[4px] -rotate-45'
						: ''}"
				></span>
			</button>
		</div>

		{#if menuOpen}
			<nav
				class="border-t border-ink/10 bg-butter px-5 py-6 md:hidden"
				aria-label="Mobile"
				transition:slide={{ duration: 280 }}
			>
				<ul class="grid grid-cols-2 gap-2">
					{#each links as link (link.href)}
						<li>
							<a
								href={link.href}
								class="nav-cut {link.color} block px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink"
								onclick={() => (menuOpen = false)}
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		{/if}
	</div>
	<WavyEdge />
</header>
