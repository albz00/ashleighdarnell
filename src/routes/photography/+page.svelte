<script lang="ts">
	import ContentSectionBlock from '$lib/components/ContentSectionBlock.svelte';
	import Placeholder from '$lib/components/Placeholder.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import Wave from '$lib/components/Wave.svelte';
	import { pageContent } from '$lib/content/page-content';
	import { photoFilters } from '$lib/content/photography';
	import { rotateMedia } from '$lib/actions/rotate-media';

	let active = $state('All');
	let visibleShots = $state(10);

	type Tint = 'blush' | 'butter' | 'mint' | 'lilac';
	const tints: Tint[] = ['blush', 'butter', 'mint', 'lilac'];
	const ratios = ['3/4', '4/5', '1/1', '4/5', '3/4', '1/1', '4/5', '3/4', '1/1'];
	const photography = $derived($pageContent.photography);
	const allShots = $derived(
		photography.shots.map((shot, index) => ({
			...shot,
			ratio: ratios[index] ?? '4/5',
			tint: tints[index % tints.length]
		}))
	);
	const filteredShots = $derived(
		allShots.filter(
			(shot) => active === 'All' || photoFilters(shot, photography.categories).includes(active)
		)
	);
	const shots = $derived(filteredShots.slice(0, visibleShots));

	$effect(() => {
		if (!photography.categories.includes(active)) {
			active = 'All';
			visibleShots = 10;
		}
	});
</script>

<svelte:head>
	<title>{photography.seoTitle}</title>
	<link rel="preload" as="image" href={photography.background.src} fetchpriority="high" />
</svelte:head>

<section
	class="backdrop-forest relative bg-paper"
	data-content-section="photography.hero"
	data-content-label="Photography → Hero"
	style:--managed-bg={'url("' + photography.background.src + '")'}
	use:rotateMedia={{ media: photography.background, background: true }}
>
	<div class="mx-auto max-w-6xl px-5 pt-20 pb-16 md:px-8 md:pt-28 md:pb-20">
		<div class="flex flex-wrap items-end justify-between gap-6">
			<Reveal delay={80}>
				<h1 class="page-display font-display">
					{photography.title}<span class="text-coral">.</span>
				</h1>
			</Reveal>
			<Reveal delay={160}>
				<p class="max-w-sm text-sm leading-relaxed text-muted">
					{photography.intro}
				</p>
			</Reveal>
		</div>
	</div>
	{#if photography.background.caption}
		<p class="absolute bottom-4 right-5 rounded-full bg-ink/60 px-3 py-1.5 text-[10px] text-paper backdrop-blur-sm">
			{photography.background.caption}
		</p>
	{/if}
</section>

<div class="flex flex-col">
<div style:order={photography.sectionOrder.indexOf('gallery')}>
<section class="sticky top-[100px] z-40 border-y border-line bg-paper/90 backdrop-blur md:top-[120px]" data-content-section="photography.filters" data-content-label="Photography → Filters">
	<div class="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 md:px-8">
		{#each photography.categories as category (category)}
			<button
				onclick={() => {
					active = category;
					visibleShots = 10;
				}}
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

<section class="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16" data-content-section="photography.gallery" data-content-label="Photography → Gallery">
	<div class="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
		{#each shots as shot, i (shot.src)}
			<Reveal delay={(i % 3) * 70} class="break-inside-avoid">
				<div class="page-polaroid group">
					<Placeholder
						label={shot.caption || `photo ${i + 1}`}
						src={shot.src}
						alt={shot.alt}
						rotation={shot.rotation}
						rotationSeconds={shot.rotationSeconds}
						builderInfo={`Filters: ${photoFilters(shot, photography.categories).join(', ') || 'None'}`}
						ratio={shot.ratio}
						tint={shot.tint}
						class="outline-frame"
					/>
					<p class="page-polaroid-caption">{shot.caption}</p>
				</div>
			</Reveal>
		{:else}
			<p class="py-16 text-center text-sm text-muted">No photographs match this filter yet.</p>
		{/each}
	</div>
	{#if visibleShots < filteredShots.length}
		<div class="mt-12 text-center">
			<button
				type="button"
				onclick={() => (visibleShots += 10)}
				class="rounded-full border border-coral bg-paper px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-coral transition-colors hover:bg-coral hover:text-paper"
			>
				Load 10 more photographs
			</button>
		</div>
	{/if}
</section>
</div>

{#each photography.sections.filter((section) => section.enabled) as section (section.id)}
	<div style:order={photography.sectionOrder.indexOf(section.id)}>
		<ContentSectionBlock block={section} page="photography" />
	</div>
{/each}

<div style:order={photography.sectionOrder.indexOf('cta')}>
	<Wave fill="blush" size="lg" class="bg-paper" />
	<section class="bg-blush" data-content-section="photography.cta" data-content-label="Photography → Contact callout">
		<div
			class="mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 pt-10 pb-24 md:flex-row md:items-center md:justify-between md:px-8 md:pt-14 md:pb-28"
		>
			<Reveal>
				<div>
					<h2 class="page-section-title font-display max-w-3xl">{photography.ctaTitle}</h2>
					<p class="mt-4 text-sm text-ink/60">
						{photography.ctaText}
					</p>
				</div>
			</Reveal>
			<Reveal delay={100}>
				<a
					href="/contact"
					class="btn-fun inline-flex items-center gap-2 rounded-full border border-coral bg-coral px-7 py-3.5 text-[12px] uppercase tracking-[0.2em] text-paper hover:border-ink hover:bg-ink"
				>
					{photography.ctaButton}
				</a>
			</Reveal>
		</div>
	</section>
</div>
</div>
