<script lang="ts">
	import Placeholder from '$lib/components/Placeholder.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import Wave from '$lib/components/Wave.svelte';
	import { pageContent } from '$lib/content/page-content';
	import { rotateMedia } from '$lib/actions/rotate-media';

	const factStyles = [
		{
			bg: 'bg-blush',
			span: 'md:col-span-7'
		},
		{
			bg: 'bg-butter',
			span: 'md:col-span-5'
		},
		{
			bg: 'bg-mint',
			span: 'md:col-span-5'
		},
		{
			bg: 'bg-lilac',
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
	data-content-section="about.hero"
	data-content-label="About → Hero"
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
<section class="bg-mist" data-content-section="about.story" data-content-label="About → Story & facts">
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
						class="fact-bubble card-lift relative mb-4 h-full min-h-56 rounded-[2.25rem] p-7 md:p-9 {factStyles[i]?.bg ?? 'bg-blush'}"
					>
						<h3 class="font-display max-w-md text-3xl leading-tight md:text-4xl">
							{fact.title}
						</h3>
						<p class="mt-4 max-w-xl text-sm leading-relaxed text-ink/65">{fact.text}</p>
					</article>
				</Reveal>
			{/each}
		</div>

		<Reveal delay={160}>
			<div
				class="camera-bubble mt-7 grid items-center gap-5 rounded-[2rem] bg-teal px-7 py-6 text-paper sm:grid-cols-[10rem_1fr] md:grid-cols-[12rem_1fr] md:px-9"
			>
				<img
					src="https://imagedelivery.net/FvOXf_HoZxDXgXU5xPiCfw/58e4db61-b4ea-4a57-3cc5-e8208facbf00/public"
					alt="Illustration of Ashleigh’s Canon camera and lenses"
					class="mx-auto w-36 drop-shadow-[0_10px_14px_rgba(0,0,0,0.18)] sm:w-40 md:w-48"
					loading="lazy"
				/>
				<div>
					<p class="font-display text-2xl md:text-3xl">{about.gearTitle}</p>
					<p class="mt-3 text-sm leading-relaxed text-paper/75">
						{about.gearText}
					</p>
				</div>
			</div>
		</Reveal>
	</div>
</section>

<style>
	.fact-bubble {
		filter: drop-shadow(0 3px 0 color-mix(in srgb, var(--color-ink) 10%, transparent));
	}

	.fact-bubble::after {
		position: absolute;
		bottom: -0.9rem;
		left: 2.5rem;
		width: 1.8rem;
		height: 1.8rem;
		background: inherit;
		clip-path: polygon(0 0, 100% 0, 0 100%);
		content: '';
	}

	.camera-bubble {
		position: relative;
		box-shadow: 0 12px 28px color-mix(in srgb, var(--color-teal) 20%, transparent);
	}

	.camera-bubble::after {
		position: absolute;
		bottom: -0.9rem;
		left: 2.5rem;
		width: 1.8rem;
		height: 1.8rem;
		border-radius: 0 0 0 0.45rem;
		background: var(--color-teal);
		clip-path: polygon(0 0, 100% 0, 0 100%);
		content: '';
	}

</style>

<Wave fill="violet" size="lg" class="bg-mist" />
<section class="bg-violet text-paper" data-content-section="about.cta" data-content-label="About → Contact callout">
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
