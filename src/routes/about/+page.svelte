<script lang="ts">
	import Floater from '$lib/components/Floater.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Placeholder from '$lib/components/Placeholder.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import SectionLabel from '$lib/components/SectionLabel.svelte';
	import Wave from '$lib/components/Wave.svelte';

	const facts = [
		{ text: 'Lorem ipsum dolor sit amet consectetur', bg: 'bg-blush', num: 'text-coral' },
		{ text: 'Adipiscing elit sed do eiusmod tempor', bg: 'bg-butter', num: 'text-marigold' },
		{ text: 'Incididunt ut labore et dolore magna', bg: 'bg-mint', num: 'text-teal' },
		{ text: 'Aliqua ut enim ad minim veniam quis', bg: 'bg-lilac', num: 'text-violet' }
	];
</script>

<svelte:head>
	<title>About - Ashleigh Darnell</title>
</svelte:head>

<section class="relative overflow-x-clip">
	<div
		class="animate-drift pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet/15 blur-3xl"
	></div>
	<div
		class="animate-drift-slow pointer-events-none absolute top-1/3 -right-28 h-80 w-80 rounded-full bg-marigold/20 blur-3xl"
	></div>
	<div
		class="relative mx-auto grid max-w-6xl items-start gap-12 px-5 pt-16 pb-20 md:grid-cols-[1fr_1.2fr] md:px-8 md:pt-24"
	>
		<Reveal class="relative">
			<Placeholder label="portrait" ratio="4/5" tint="lilac" />
			<Floater tint="mint" size="md" class="-right-4 -bottom-4 hidden md:flex" />
			<Floater
				tint="butter"
				size="sm"
				motion="float"
				spin="spin-wobble"
				class="top-6 -left-5 hidden md:flex"
				style="animation-delay: -2s"
			/>
		</Reveal>
		<Reveal delay={120}>
			<div>
				<SectionLabel text="About" accent="marigold" />
				<h1 class="font-display mt-6 text-4xl leading-tight tracking-tight md:text-6xl">
					Lorem ipsum <span class="font-cursive text-[1.4em] leading-none text-violet">dolor sit</span> amet
				</h1>
				<div class="mt-6 max-w-lg space-y-4 leading-relaxed text-muted">
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
						incididunt ut labore et dolore magna aliqua.
					</p>
					<p>
						Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
						ea commodo consequat.
					</p>
					<p>
						Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
						nulla pariatur.
					</p>
				</div>
			</div>
		</Reveal>
	</div>
</section>

<div class="relative overflow-x-clip">
	<div
		class="animate-drift pointer-events-none absolute top-0 -right-20 h-72 w-72 rounded-full bg-blush/70 blur-3xl"
	></div>
	<div
		class="animate-drift-slow pointer-events-none absolute bottom-0 -left-20 h-72 w-72 rounded-full bg-mint/70 blur-3xl"
	></div>
	<Wave fill="mist" />
	<section class="bg-mist">
		<div class="relative mx-auto max-w-6xl px-5 py-16 md:px-8">
			<Reveal>
				<SectionLabel text="A few things about me" accent="coral" />
			</Reveal>
			<div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{#each facts as fact, i (fact.text)}
					<Reveal delay={i * 90}>
						<div class="card-lift rounded-3xl border border-ink/10 p-6 {fact.bg}">
							<p class="font-display text-3xl {fact.num}">0{i + 1}</p>
							<p class="mt-3 text-sm">{fact.text}</p>
						</div>
					</Reveal>
				{/each}
			</div>
		</div>
	</section>
	<Wave fill="mist" flip />
</div>

<section>
	<div class="mx-auto max-w-6xl px-5 py-20 text-center md:px-8">
		<Reveal>
			<h2 class="font-display mx-auto max-w-xl text-3xl leading-tight md:text-4xl">
				Excepteur sint occaecat cupidatat non proident
			</h2>
			<a
				href="/contact"
				class="btn-fun mt-8 inline-flex items-center gap-2 rounded-full border border-violet bg-violet px-9 py-4 text-[12px] uppercase tracking-[0.2em] text-paper hover:border-ink hover:bg-ink"
			>
				Say hello <Icon name="arrow" size={14} />
			</a>
		</Reveal>
	</div>
</section>
