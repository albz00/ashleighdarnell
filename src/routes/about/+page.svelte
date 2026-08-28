<script lang="ts">
	import Placeholder from '$lib/components/Placeholder.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import Wave from '$lib/components/Wave.svelte';
	import { pageContent } from '$lib/content/page-content';
	import { rotateMedia } from '$lib/actions/rotate-media';

	const factStyles = [
		{
			bg: 'bg-blush',
			accent: 'text-coral',
			span: 'md:col-span-7'
		},
		{
			bg: 'bg-butter',
			accent: 'text-marigold',
			span: 'md:col-span-5'
		},
		{
			bg: 'bg-mint',
			accent: 'text-teal',
			span: 'md:col-span-5'
		},
		{
			bg: 'bg-lilac',
			accent: 'text-violet',
			span: 'md:col-span-7'
		}
	];
	const about = $derived($pageContent.about);
</script>

<svelte:head>
	<title>{about.seoTitle}</title>
	<link rel="preload" as="image" href={about.background.src} fetchpriority="high" />
</svelte:head>

<section
	class="backdrop-forest relative bg-paper"
	style:--managed-bg={'url("' + about.background.src + '")'}
	use:rotateMedia={{ media: about.background, background: true }}
>
	<div
		class="mx-auto grid max-w-6xl items-center gap-16 px-5 pt-20 pb-24 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:pt-28 md:pb-32"
	>
		<Reveal>
			<div class="page-polaroid -rotate-2">
				<Placeholder label="portrait" src={about.portrait.src} alt={about.portrait.alt} rotation={about.portrait.rotation} rotationSeconds={about.portrait.rotationSeconds} ratio="4/5" tint="lilac" class="outline-frame" />
				<p class="page-polaroid-caption">{about.portrait.caption}</p>
			</div>
		</Reveal>
		<Reveal delay={120}>
			<div>
				<h1 class="page-display font-display">
					{about.titlePrefix} <span class="font-cursive text-[1.4em] leading-none text-violet">{about.titleName}</span>
				</h1>
				<div class="mt-6 max-w-lg space-y-4 leading-relaxed text-muted">
					{#each about.intro as paragraph}
						<p>{paragraph}</p>
					{/each}
				</div>
			</div>
		</Reveal>
	</div>
	{#if about.background.caption}
		<p class="absolute bottom-4 right-5 rounded-full bg-ink/60 px-3 py-1.5 text-[10px] text-paper backdrop-blur-sm">
			{about.background.caption}
		</p>
	{/if}
</section>

<Wave fill="mist" size="lg" class="bg-paper" />
<section class="bg-mist">
	<div class="mx-auto max-w-6xl px-5 pt-10 pb-20 md:px-8 md:pt-14 md:pb-28">
		<div class="grid gap-6 md:grid-cols-[0.7fr_1.3fr] md:items-end">
			<Reveal>
				<h2 class="page-section-title font-display">
					{about.sectionTitle}
				</h2>
			</Reveal>
			<Reveal delay={80}>
				<p class="max-w-xl leading-relaxed text-muted md:justify-self-end">
					{about.sectionText}
				</p>
			</Reveal>
		</div>

		<div class="mt-12 grid gap-5 md:grid-cols-12">
			{#each about.facts as fact, i (fact.text)}
				<Reveal delay={i * 90} class={factStyles[i]?.span ?? ''}>
					<article
						class="card-lift group relative h-full min-h-56 overflow-hidden rounded-[2.25rem] p-7 md:p-9 {factStyles[i]?.bg ?? 'bg-blush'}"
					>
						<span
							class="absolute -right-3 -top-10 font-display text-[8rem] leading-none opacity-[0.07] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
							>{i + 1}</span
						>
						<p class="text-[11px] font-semibold uppercase tracking-[0.22em] {factStyles[i]?.accent ?? 'text-coral'}">
							{fact.kicker}
						</p>
						<h3 class="font-display mt-8 max-w-md text-3xl leading-tight md:text-4xl">
							{fact.title}
						</h3>
						<p class="mt-4 max-w-xl text-sm leading-relaxed text-ink/65">{fact.text}</p>
					</article>
				</Reveal>
			{/each}
		</div>

		<Reveal delay={160}>
			<div
				class="mt-5 flex flex-col gap-3 rounded-[2rem] bg-teal px-7 py-6 text-paper md:flex-row md:items-center md:justify-between md:px-9"
			>
				<p class="font-display text-2xl">{about.gearTitle}</p>
				<p class="text-sm text-paper/70">
					{about.gearText}
				</p>
			</div>
		</Reveal>
	</div>
</section>

<Wave fill="violet" size="lg" class="bg-mist" />
<section class="bg-violet text-paper">
	<div class="mx-auto max-w-6xl px-5 pt-10 pb-24 text-center md:px-8 md:pt-14 md:pb-32">
		<Reveal>
			<h2 class="page-section-title font-display mx-auto max-w-3xl">
				{about.ctaTitle}
			</h2>
			<a
				href="/contact"
				class="btn-fun mt-10 inline-flex rounded-full bg-paper px-9 py-4 text-[12px] uppercase tracking-[0.2em] text-ink hover:bg-butter"
			>
				{about.ctaButton}
			</a>
		</Reveal>
	</div>
</section>
