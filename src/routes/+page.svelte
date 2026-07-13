<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Floater from '$lib/components/Floater.svelte';
	import Placeholder from '$lib/components/Placeholder.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import SectionLabel from '$lib/components/SectionLabel.svelte';
	import Squiggle from '$lib/components/Squiggle.svelte';
	import Wave from '$lib/components/Wave.svelte';
</script>

<svelte:head>
	<title>Ashleigh Darnell</title>
	<meta name="description" content="Lorem ipsum dolor sit amet, consectetur adipiscing elit." />
</svelte:head>

<!-- ============ HERO + CREDIBILITY REGION (shared spotlights) ============ -->
<div class="relative overflow-x-clip">
	<!-- gradient spotlights -->
	<div
		class="animate-drift pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-coral/15 blur-3xl"
	></div>
	<div
		class="animate-drift-slow pointer-events-none absolute top-1/4 -right-32 h-[28rem] w-[28rem] rounded-full bg-violet/15 blur-3xl"
	></div>
	<div
		class="animate-drift pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-marigold/20 blur-3xl"
		style="animation-delay: -6s"
	></div>

	<section>
		<div
			class="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pt-16 pb-20 md:grid-cols-[1.2fr_1fr] md:px-8 md:pt-24"
		>
			<div>
				<Reveal>
					<SectionLabel text="Lorem ipsum dolor" accent="coral" />
				</Reveal>
				<Reveal delay={80}>
					<h1 class="font-display mt-6 text-5xl leading-[1.05] tracking-tight md:text-7xl">
						Lorem ipsum<br />
						<span class="text-coral italic">dolor sit</span> amet
					</h1>
				</Reveal>
				<Reveal delay={160}>
					<p class="mt-6 max-w-md text-base leading-relaxed text-muted">
						[Short supporting sentence: who Ashleigh is and what she does, warm and playful but
						professional.] Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
						tempor incididunt ut labore.
					</p>
				</Reveal>
				<Reveal delay={240}>
					<div class="mt-10 flex flex-wrap gap-4">
						<a
							href="/photography"
							class="btn-fun inline-flex items-center gap-2 rounded-full border border-coral bg-coral px-7 py-3.5 text-[12px] uppercase tracking-[0.2em] text-paper hover:border-ink hover:bg-ink"
						>
							Photography <Icon name="arrow" size={14} />
						</a>
						<a
							href="/social"
							class="btn-fun inline-flex items-center gap-2 rounded-full border border-teal px-7 py-3.5 text-[12px] uppercase tracking-[0.2em] text-teal hover:bg-teal hover:text-paper"
						>
							Social Media <Icon name="arrow" size={14} />
						</a>
					</div>
				</Reveal>
			</div>

			<Reveal delay={120} class="relative">
				<Placeholder label="hero portrait" ratio="4/5" tint="blush" />
				<Floater
					icon="spark"
					tint="butter"
					size="lg"
					class="-bottom-6 -left-6 hidden md:flex"
				/>
				<Floater
					icon="asterisk"
					tint="lilac"
					size="sm"
					motion="float"
					spin="spin-wobble"
					class="-top-4 -right-3 hidden md:flex"
					style="animation-delay: -1.5s"
				/>
			</Reveal>
		</div>
	</section>

	<!-- ============ CREDIBILITY / MARQUEE STRIP ============ -->
	<Wave fill="butter" />
	<section class="bg-butter">
		<div
			class="relative mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-6 text-[11px] uppercase tracking-[0.25em] text-ink/70 md:justify-between md:px-8"
		>
			<span>Consectetur adipiscing</span>
			<span class="inline-flex animate-spin-slow">
				<Icon name="asterisk" size={10} class="text-coral" />
			</span>
			<span>Sed do eiusmod</span>
			<span class="inline-flex animate-spin-slow" style="animation-direction: reverse; animation-duration: 16s">
				<Icon name="asterisk" size={10} class="text-teal" />
			</span>
			<span>Ut labore et dolore</span>
			<span class="hidden animate-spin-wobble md:inline-flex">
				<Icon name="asterisk" size={10} class="text-violet" />
			</span>
			<span class="hidden md:block">Magna aliqua enim</span>
		</div>
	</section>
	<Wave fill="butter" flip />
</div>

<!-- ============ TWO PORTFOLIO DOORS ============ -->
<section class="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
	<Reveal>
		<SectionLabel text="Two sides of the work" accent="violet" />
		<h2 class="font-display mt-4 max-w-xl text-3xl leading-tight md:text-4xl">
			Quis nostrud exercitation ullamco laboris nisi ut aliquip
		</h2>
	</Reveal>

	<div class="mt-12 grid gap-6 md:grid-cols-2">
		<Reveal delay={80}>
			<a
				href="/photography"
				class="card-lift group block rounded-3xl border border-line p-6 hover:border-coral/50 hover:bg-blush"
			>
				<div class="flex items-center justify-between">
					<span class="inline-flex animate-spin-slower text-coral">
						<Icon name="camera" size={22} />
					</span>
					<Icon
						name="arrow"
						size={18}
						class="text-coral transition-transform duration-300 group-hover:translate-x-1.5"
					/>
				</div>
				<Placeholder label="photography cover" ratio="16/10" tint="blush" class="mt-6" />
				<h3 class="font-display mt-6 text-2xl">Photography</h3>
				<p class="mt-2 text-sm text-muted">
					Duis aute irure dolor in reprehenderit in voluptate velit esse.
				</p>
			</a>
		</Reveal>

		<Reveal delay={180}>
			<a
				href="/social"
				class="card-lift group block rounded-3xl border border-line p-6 hover:border-teal/50 hover:bg-mint"
			>
			<div class="flex items-center justify-between">
					<span class="inline-flex animate-spin-slower text-teal" style="animation-direction: reverse">
						<Icon name="at" size={22} />
					</span>
					<Icon
						name="arrow"
						size={18}
						class="text-teal transition-transform duration-300 group-hover:translate-x-1.5"
					/>
				</div>
				<Placeholder label="social media cover" ratio="16/10" tint="mint" class="mt-6" />
				<h3 class="font-display mt-6 text-2xl">Social Media</h3>
				<p class="mt-2 text-sm text-muted">
					Excepteur sint occaecat cupidatat non proident sunt in culpa.
				</p>
			</a>
		</Reveal>
	</div>
</section>

<!-- ============ ABOUT TEASER ============ -->
<Reveal>
	<div class="flex justify-center">
		<Squiggle class="text-marigold" />
	</div>
</Reveal>
<section>
	<div
		class="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-[1fr_1.2fr] md:px-8 md:py-28"
	>
		<Reveal>
			<Placeholder label="about photo" ratio="4/5" tint="butter" class="max-w-sm" />
		</Reveal>
		<Reveal delay={120}>
			<div>
				<SectionLabel text="Meet Ashleigh" accent="marigold" />
				<h2 class="font-display mt-4 text-3xl leading-tight md:text-4xl">
					Ut enim ad minim veniam quis nostrud
				</h2>
				<p class="mt-5 max-w-md leading-relaxed text-muted">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
					ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
					ullamco laboris nisi ut aliquip ex ea commodo consequat.
				</p>
				<a
					href="/about"
					class="mt-8 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] underline decoration-marigold decoration-2 underline-offset-8 transition-colors hover:text-marigold"
				>
					More about me <Icon name="arrow" size={14} />
				</a>
			</div>
		</Reveal>
	</div>
</section>

<!-- ============ CONTACT CTA ============ -->
<div class="relative overflow-x-clip">
	<div
		class="animate-drift pointer-events-none absolute top-0 left-1/4 h-80 w-80 rounded-full bg-coral/30 blur-3xl"
	></div>
	<div
		class="animate-drift-slow pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-paper/20 blur-3xl"
	></div>
	<Wave fill="violet" />
	<section class="bg-violet text-paper">
		<div class="relative mx-auto max-w-6xl px-5 py-20 text-center md:px-8 md:py-28">
			<Reveal>
				<span class="mx-auto inline-flex animate-float-spin">
					<Icon name="spark" size={28} class="animate-spin-slow text-marigold" />
				</span>
				<h2 class="font-display mx-auto mt-6 max-w-2xl text-3xl leading-tight md:text-5xl">
					Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
				</h2>
				<a
					href="/contact"
					class="btn-fun mt-10 inline-flex items-center gap-2 rounded-full border border-paper bg-paper px-9 py-4 text-[12px] uppercase tracking-[0.2em] text-ink hover:bg-butter"
				>
					Get in touch <Icon name="arrow" size={14} />
				</a>
			</Reveal>
		</div>
	</section>
</div>
