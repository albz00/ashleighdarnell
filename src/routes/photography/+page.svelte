<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Floater from '$lib/components/Floater.svelte';
	import Placeholder from '$lib/components/Placeholder.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import SectionLabel from '$lib/components/SectionLabel.svelte';
	import Wave from '$lib/components/Wave.svelte';

	const categories = ['All', 'Portraits', 'Editorial', 'Events'];
	let active = $state('All');

	type Tint = 'blush' | 'butter' | 'mint' | 'lilac';
	const tints: Tint[] = ['blush', 'butter', 'mint', 'lilac'];
	const shots = [
		{ label: 'photo 01', ratio: '3/4' },
		{ label: 'photo 02', ratio: '4/5' },
		{ label: 'photo 03', ratio: '1/1' },
		{ label: 'photo 04', ratio: '4/5' },
		{ label: 'photo 05', ratio: '3/4' },
		{ label: 'photo 06', ratio: '1/1' },
		{ label: 'photo 07', ratio: '4/5' },
		{ label: 'photo 08', ratio: '3/4' },
		{ label: 'photo 09', ratio: '1/1' }
	].map((shot, i) => ({ ...shot, tint: tints[i % tints.length] }));
</script>

<svelte:head>
	<title>Photography - Ashleigh Darnell</title>
</svelte:head>

<section class="relative overflow-x-clip">
	<div
		class="animate-drift pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-coral/15 blur-3xl"
	></div>
	<div
		class="animate-drift-slow pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-butter/60 blur-3xl"
	></div>
	<div class="relative mx-auto max-w-6xl px-5 pt-16 pb-12 md:px-8 md:pt-24">
		<Floater
			icon="camera"
			tint="blush"
			size="md"
			class="top-10 right-8 hidden lg:flex"
			style="animation-delay: -1s"
		/>
		<Floater
			icon="asterisk"
			tint="butter"
			size="sm"
			spin="spin-wobble"
			class="top-28 right-36 hidden lg:flex"
			style="animation-delay: -2.5s"
		/>
		<Reveal>
			<SectionLabel text="Portfolio no. 1" accent="coral" />
		</Reveal>
		<div class="mt-6 flex flex-wrap items-end justify-between gap-6">
			<Reveal delay={80}>
				<h1 class="font-display text-5xl tracking-tight md:text-7xl">
					Photography<span class="text-coral">.</span>
				</h1>
			</Reveal>
			<Reveal delay={160}>
				<p class="max-w-sm text-sm leading-relaxed text-muted">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
					ut labore.
				</p>
			</Reveal>
		</div>
	</div>
</section>

<section class="sticky top-[100px] z-40 border-y border-line bg-paper/90 backdrop-blur md:top-[120px]">
	<div class="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 md:px-8">
		{#each categories as category (category)}
			<button
				onclick={() => (active = category)}
				class="whitespace-nowrap rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.15em] transition-all duration-200
					{active === category
					? 'border-coral bg-coral text-paper'
					: 'border-line text-muted hover:border-coral hover:text-coral hover:-translate-y-0.5'}"
			>
				{category}
			</button>
		{/each}
	</div>
</section>

<section class="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
	<div class="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
		{#each shots as shot, i (shot.label)}
			<Reveal delay={(i % 3) * 70} class="break-inside-avoid">
				<div class="group">
					<Placeholder label={shot.label} ratio={shot.ratio} tint={shot.tint} />
				</div>
			</Reveal>
		{/each}
	</div>
</section>

<div class="relative overflow-x-clip">
	<div
		class="animate-drift pointer-events-none absolute top-0 -left-20 h-72 w-72 rounded-full bg-coral/20 blur-3xl"
	></div>
	<div
		class="animate-drift-slow pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-lilac/60 blur-3xl"
	></div>
	<Wave fill="blush" />
	<section class="bg-blush">
		<div
			class="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-8"
		>
			<Reveal>
				<div>
					<h2 class="font-display text-2xl md:text-3xl">Ut enim ad minim veniam quis nostrud</h2>
					<p class="mt-2 text-sm text-ink/60">
						Duis aute irure dolor in reprehenderit in voluptate velit
					</p>
				</div>
			</Reveal>
			<Reveal delay={100}>
				<a
					href="/contact"
					class="btn-fun inline-flex items-center gap-2 rounded-full border border-coral bg-coral px-7 py-3.5 text-[12px] uppercase tracking-[0.2em] text-paper hover:border-ink hover:bg-ink"
				>
					Book a session <Icon name="arrow" size={14} />
				</a>
			</Reveal>
		</div>
	</section>
</div>
