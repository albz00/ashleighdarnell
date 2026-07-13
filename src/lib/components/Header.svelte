<script lang="ts">
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';
	import Icon from './Icon.svelte';
	import WavyEdge from './WavyEdge.svelte';

	// each destination gets its own signature accent
	const links = [
		{ href: '/photography', label: 'Photography', underline: 'decoration-coral' },
		{ href: '/social', label: 'Social Media', underline: 'decoration-teal' },
		{ href: '/about', label: 'About', underline: 'decoration-marigold' },
		{ href: '/contact', label: 'Contact', underline: 'decoration-violet' }
	];

	let menuOpen = $state(false);

	const isActive = (href: string) => page.url.pathname.startsWith(href);
</script>

<header class="sticky top-0 z-50">
	<div class="bg-paper/90 backdrop-blur">
		<div class="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 md:h-24 md:px-8">
			<a
				href="/"
				class="font-display text-2xl tracking-tight transition-colors hover:text-coral md:text-3xl"
				onclick={() => (menuOpen = false)}
			>
				Ashleigh Darnell
			</a>

			<nav class="hidden items-center gap-9 md:flex" aria-label="Primary">
				{#each links as link (link.href)}
					<a
						href={link.href}
						class="text-[14px] uppercase tracking-[0.15em] underline-offset-8 transition-colors hover:text-ink hover:underline hover:decoration-2 {link.underline}
							{isActive(link.href) ? 'text-ink' : 'text-muted'}"
					>
						{link.label}
					</a>
				{/each}
			</nav>

			<button
				class="md:hidden"
				onclick={() => (menuOpen = !menuOpen)}
				aria-expanded={menuOpen}
				aria-label="Toggle menu"
			>
				<Icon name={menuOpen ? 'close' : 'menu'} size={24} />
			</button>
		</div>

		{#if menuOpen}
			<nav
				class="border-t border-line px-5 py-6 md:hidden"
				aria-label="Mobile"
				transition:slide={{ duration: 280 }}
			>
				<ul class="flex flex-col gap-5">
					{#each links as link (link.href)}
						<li>
							<a
								href={link.href}
								class="text-sm uppercase tracking-[0.15em] text-muted underline-offset-8 hover:underline hover:decoration-2 {link.underline}"
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
