<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Floater from '$lib/components/Floater.svelte';
	import Placeholder from '$lib/components/Placeholder.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import SectionLabel from '$lib/components/SectionLabel.svelte';
	import Squiggle from '$lib/components/Squiggle.svelte';
	import Wave from '$lib/components/Wave.svelte';

	const stats = [
		{ value: '24k', label: 'Lorem ipsum', color: 'text-coral' },
		{ value: '89%', label: 'Dolor sit', color: 'text-teal' },
		{ value: '120+', label: 'Consectetur', color: 'text-violet' }
	];

	const caseStudies = [
		{ name: 'Lorem Ipsum Studio', tag: 'Instagram · Content' },
		{ name: 'Dolor Sit Co.', tag: 'TikTok · Strategy' },
		{ name: 'Amet Consectetur', tag: 'Multi-platform · Management' }
	];
</script>

<svelte:head>
	<title>Social Media - Ashleigh Darnell</title>
</svelte:head>

<section class="relative overflow-x-clip">
	<div
		class="animate-drift pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-teal/15 blur-3xl"
	></div>
	<div
		class="animate-drift-slow pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-lilac/60 blur-3xl"
	></div>
	<div class="relative mx-auto max-w-6xl px-5 pt-16 pb-12 md:px-8 md:pt-24">
		<Floater
			icon="at"
			tint="mint"
			size="md"
			class="top-10 right-8 hidden lg:flex"
			style="animation-delay: -1.2s"
		/>
		<Floater
			icon="spark"
			tint="lilac"
			size="sm"
			spin="spin-wobble"
			class="top-32 right-40 hidden lg:flex"
			style="animation-delay: -3s"
		/>
		<Reveal>
			<SectionLabel text="Portfolio no. 2" accent="teal" />
		</Reveal>
		<div class="mt-6 flex flex-wrap items-end justify-between gap-6">
			<Reveal delay={80}>
				<h1 class="font-display text-5xl tracking-tight md:text-7xl">
					Social Media<span class="text-teal">.</span>
				</h1>
			</Reveal>
			<Reveal delay={160}>
				<p class="max-w-sm text-sm leading-relaxed text-muted">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam quis
					nostrud exercitation.
				</p>
			</Reveal>
		</div>
	</div>
</section>

<section class="border-y border-line">
	<div class="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-line px-5 md:px-8">
		{#each stats as stat, i (stat.label)}
			<Reveal delay={i * 90}>
				<div class="px-4 py-8 text-center first:pl-0 last:pr-0">
					<p class="font-display text-3xl md:text-4xl {stat.color}">{stat.value}</p>
					<p class="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted">{stat.label}</p>
				</div>
			</Reveal>
		{/each}
	</div>
</section>

<section class="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
	<Reveal>
		<SectionLabel text="Selected content" accent="teal" />
	</Reveal>
	<div class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
		<Reveal delay={0}>
			<div class="group"><Placeholder label="reel 01" ratio="9/16" tint="mint" /></div>
		</Reveal>
		<Reveal delay={80}>
			<div class="group md:mt-10">
				<Placeholder label="reel 02" ratio="9/16" tint="lilac" />
			</div>
		</Reveal>
		<Reveal delay={160}>
			<div class="group"><Placeholder label="reel 03" ratio="9/16" tint="blush" /></div>
		</Reveal>
		<Reveal delay={240}>
			<div class="group md:mt-10">
				<Placeholder label="reel 04" ratio="9/16" tint="butter" />
			</div>
		</Reveal>
	</div>
</section>

<Reveal>
	<div class="flex justify-center">
		<Squiggle class="text-violet" />
	</div>
</Reveal>
<section>
	<div class="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
		<Reveal>
			<SectionLabel text="Case studies" accent="violet" />
		</Reveal>
		<ul class="mt-8 divide-y divide-line border-y border-line">
			{#each caseStudies as cs, i (cs.name)}
				<li>
					<Reveal delay={i * 80}>
						<a
							href="/contact"
							class="group flex items-center justify-between gap-4 rounded-2xl px-4 py-6 transition-all duration-300 hover:translate-x-1 hover:bg-lilac"
						>
							<div>
								<p class="font-display text-xl md:text-2xl">{cs.name}</p>
								<p class="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted">{cs.tag}</p>
							</div>
							<Icon
								name="arrow"
								size={18}
								class="shrink-0 text-violet transition-transform duration-300 group-hover:translate-x-1.5"
							/>
						</a>
					</Reveal>
				</li>
			{/each}
		</ul>
		<p class="mt-4 text-xs text-muted">Paginae casuum studii TBD, nexus sunt placeholder</p>
	</div>
</section>

<div class="relative overflow-x-clip">
	<div
		class="animate-drift pointer-events-none absolute top-0 -left-20 h-72 w-72 rounded-full bg-teal/20 blur-3xl"
	></div>
	<div
		class="animate-drift-slow pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-butter/60 blur-3xl"
	></div>
	<Wave fill="mint" />
	<section class="bg-mint">
		<div
			class="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-8"
		>
			<Reveal>
				<div>
					<h2 class="font-display text-2xl md:text-3xl">
						Excepteur sint occaecat cupidatat non proident
					</h2>
					<p class="mt-2 text-sm text-ink/60">
						Sunt in culpa qui officia deserunt mollit anim id est laborum
					</p>
				</div>
			</Reveal>
			<Reveal delay={100}>
				<a
					href="/contact"
					class="btn-fun inline-flex items-center gap-2 rounded-full border border-teal bg-teal px-7 py-3.5 text-[12px] uppercase tracking-[0.2em] text-paper hover:border-ink hover:bg-ink"
				>
					Work together <Icon name="arrow" size={14} />
				</a>
			</Reveal>
		</div>
	</section>
</div>
