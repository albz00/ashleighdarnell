<script lang="ts">
	import { onMount } from 'svelte';
	import Placeholder from '$lib/components/Placeholder.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import Wave from '$lib/components/Wave.svelte';
	import { pageContent } from '$lib/content/page-content';
	import { rotateMedia } from '$lib/actions/rotate-media';

	const home = $derived($pageContent.home);
	let showIntro = $state(true);
	let introLeaving = $state(false);

	onMount(() => {
		const leaveTimer = window.setTimeout(() => (introLeaving = true), 550);
		const removeTimer = window.setTimeout(() => (showIntro = false), 800);

		return () => {
			window.clearTimeout(leaveTimer);
			window.clearTimeout(removeTimer);
		};
	});
</script>

<svelte:head>
	<title>{home.seoTitle}</title>
	<meta name="description" content={home.seoDescription} />
	<link rel="preload" as="image" href={home.background.src} fetchpriority="high" />
</svelte:head>

{#if showIntro}
	<div
		class="home-intro"
		class:home-intro-leaving={introLeaving}
		role="status"
		aria-label="Loading Ashleigh Darnell"
	>
		<p><span>Ashleigh</span> <em>Darnell</em></p>
		<div aria-hidden="true"></div>
	</div>
{/if}

<!-- ============ 01 · HERO ============ -->
<section
	class="hero-story backdrop-mountains relative overflow-hidden bg-paper"
	data-content-section="home.hero"
	data-content-label="Home → Hero"
	style:--managed-bg={'url("' + home.background.src + '")'}
	use:rotateMedia={{ media: home.background, background: true }}
>
	<div class="hero-backdrop" aria-hidden="true">
		<Placeholder
			label="portrait"
			src={home.backdrops[0].src}
			alt={home.backdrops[0].alt}
			caption={home.backdrops[0].caption}
			rotation={home.backdrops[0].rotation}
			rotationSeconds={home.backdrops[0].rotationSeconds}
			ratio="4/5"
			tint="blush"
			class="hero-backdrop-photo hero-backdrop-photo-a"
		/>
		<Placeholder
			label="detail"
			src={home.backdrops[1].src}
			alt={home.backdrops[1].alt}
			caption={home.backdrops[1].caption}
			rotation={home.backdrops[1].rotation}
			rotationSeconds={home.backdrops[1].rotationSeconds}
			ratio="1/1"
			tint="butter"
			class="hero-backdrop-photo hero-backdrop-photo-b"
		/>
		<Placeholder
			label="studio"
			src={home.backdrops[2].src}
			alt={home.backdrops[2].alt}
			caption={home.backdrops[2].caption}
			rotation={home.backdrops[2].rotation}
			rotationSeconds={home.backdrops[2].rotationSeconds}
			ratio="3/4"
			tint="mint"
			class="hero-backdrop-photo hero-backdrop-photo-c"
		/>
		<Placeholder
			label="editorial"
			src={home.backdrops[3].src}
			alt={home.backdrops[3].alt}
			caption={home.backdrops[3].caption}
			rotation={home.backdrops[3].rotation}
			rotationSeconds={home.backdrops[3].rotationSeconds}
			ratio="4/5"
			tint="lilac"
			class="hero-backdrop-photo hero-backdrop-photo-d"
		/>
	</div>
	<div
		class="relative z-10 mx-auto grid max-w-6xl items-center gap-16 px-5 pt-20 pb-24 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:pt-28 md:pb-32"
	>
		<div>
			<Reveal delay={80}>
				<h1 class="home-display font-display">
					{home.heroLines[0]}<br />
					<span class="home-display-accent">{home.heroLines[1]}</span><br />
					<span class="text-teal">{home.heroLines[2]}</span>
				</h1>
			</Reveal>
			<Reveal delay={160}>
				<p class="mt-8 max-w-md text-base font-medium leading-relaxed text-ink/75">
					{home.intro}
				</p>
			</Reveal>
			<Reveal delay={240}>
				<div class="mt-10 flex flex-wrap gap-4">
					<a
						href="/photography"
						class="btn-fun outline-button inline-flex items-center gap-2 rounded-full bg-coral px-7 py-3.5 text-[12px] uppercase tracking-[0.2em] text-paper hover:bg-ink"
					>
						{home.primaryCta}
					</a>
					<a
						href="/social"
						class="btn-fun outline-button inline-flex items-center gap-2 rounded-full bg-mint px-7 py-3.5 text-[12px] uppercase tracking-[0.2em] text-teal hover:bg-teal hover:text-paper"
					>
						{home.secondaryCta}
					</a>
				</div>
			</Reveal>
		</div>

		<Reveal delay={120} class="mx-2 md:mx-0">
			<div
				class="hero-gallery"
				role="img"
				aria-label="A rotating selection of creative work"
			>
				<div class="hero-photo-card hero-photo-card-a">
					<Placeholder
						label="portrait story"
						src={home.gallery[0].src}
						alt={home.gallery[0].alt}
						rotation={home.gallery[0].rotation}
						rotationSeconds={home.gallery[0].rotationSeconds}
						loading="eager"
						fetchpriority="high"
						ratio="4/5"
						tint="blush"
						class="hero-card-media outline-frame"
					/>
					<p class="hero-polaroid-caption">{home.gallery[0].caption}</p>
				</div>
				<div class="hero-photo-card hero-photo-card-b">
					<Placeholder
						label="brand story"
						src={home.gallery[1].src}
						alt={home.gallery[1].alt}
						rotation={home.gallery[1].rotation}
						rotationSeconds={home.gallery[1].rotationSeconds}
						ratio="4/5"
						tint="mint"
						class="hero-card-media outline-frame"
					/>
					<p class="hero-polaroid-caption">{home.gallery[1].caption}</p>
				</div>
				<div class="hero-photo-card hero-photo-card-c">
					<Placeholder
						label="social story"
						src={home.gallery[2].src}
						alt={home.gallery[2].alt}
						rotation={home.gallery[2].rotation}
						rotationSeconds={home.gallery[2].rotationSeconds}
						ratio="4/5"
						tint="butter"
						class="hero-card-media outline-frame"
					/>
					<p class="hero-polaroid-caption">{home.gallery[2].caption}</p>
				</div>
			</div>
		</Reveal>
	</div>
	{#if home.background.caption}
		<p class="absolute bottom-4 right-5 z-20 rounded-full bg-ink/60 px-3 py-1.5 text-[10px] text-paper backdrop-blur-sm">
			{home.background.caption}
		</p>
	{/if}
</section>

<!-- ============ 02 · WHAT I CREATE (blush) ============ -->
<Wave fill="blush" size="lg" class="bg-paper" />
<section class="bg-blush" data-content-section="home.services" data-content-label="Home → Services">
	<div class="mx-auto max-w-6xl px-5 pt-10 pb-20 md:px-8 md:pt-14 md:pb-28">
		<Reveal>
			<h2 class="home-section-title font-display max-w-4xl">
				{home.createTitle}
			</h2>
		</Reveal>

		<div class="mt-14 grid gap-8 md:grid-cols-2">
			<Reveal delay={80}>
				<a
					href={home.services[0].href}
					class="card-lift group block rounded-[2.5rem] bg-violet p-6 text-paper"
				>
					<Placeholder label="photography cover" src={home.services[0].image.src} alt={home.services[0].image.alt} caption={home.services[0].image.caption} rotation={home.services[0].image.rotation} rotationSeconds={home.services[0].image.rotationSeconds} ratio="16/10" tint="blush" class="arch-soft outline-frame" />
					<h3 class="font-display mt-6 text-2xl">{home.services[0].title}</h3>
					<p class="mt-2 text-sm text-paper/75">
						{home.services[0].text}
					</p>
				</a>
			</Reveal>

			<Reveal delay={180}>
				<a href={home.services[1].href} class="card-lift group block rounded-[2.5rem] bg-marigold p-6">
					<Placeholder label="social media cover" src={home.services[1].image.src} alt={home.services[1].image.alt} caption={home.services[1].image.caption} rotation={home.services[1].image.rotation} rotationSeconds={home.services[1].image.rotationSeconds} ratio="16/10" tint="mint" class="arch-soft outline-frame" />
					<h3 class="font-display mt-6 text-2xl">{home.services[1].title}</h3>
					<p class="mt-2 text-sm text-ink/70">
						{home.services[1].text}
					</p>
				</a>
			</Reveal>
		</div>
	</div>
</section>

<style>
	.home-intro {
		position: fixed;
		z-index: 1000;
		inset: 0;
		display: grid;
		place-content: center;
		gap: 1rem;
		overflow: hidden;
		background: var(--color-paper);
		color: var(--color-ink);
		transition:
			opacity 250ms ease,
			visibility 250ms ease;
	}

	.home-intro::before,
	.home-intro::after {
		position: absolute;
		width: 13rem;
		height: 13rem;
		border-radius: 999px;
		content: '';
		filter: blur(1px);
		opacity: 0.7;
		animation: intro-shape 600ms ease-out both;
	}

	.home-intro::before {
		top: -5rem;
		right: -4rem;
		background: var(--color-blush);
	}

	.home-intro::after {
		bottom: -6rem;
		left: -4rem;
		background: var(--color-mint);
		animation-delay: 60ms;
	}

	.home-intro p {
		position: relative;
		z-index: 1;
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(2.6rem, 8vw, 5rem);
		line-height: 1;
		letter-spacing: -0.04em;
		animation: intro-name 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.home-intro em {
		font-family: var(--font-cursive);
		font-size: 1.2em;
		font-weight: 700;
		color: var(--color-coral);
	}

	.home-intro > div {
		position: relative;
		z-index: 1;
		width: 100%;
		height: 2px;
		overflow: hidden;
		background: var(--color-line);
	}

	.home-intro > div::after {
		display: block;
		width: 100%;
		height: 100%;
		background: var(--color-teal);
		content: '';
		transform-origin: left;
		animation: intro-line 650ms ease-out both;
	}

	.home-intro-leaving {
		visibility: hidden;
		opacity: 0;
	}

	@keyframes intro-name {
		from {
			opacity: 0;
			transform: translateY(0.75rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes intro-line {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}

	@keyframes intro-shape {
		from {
			opacity: 0;
			transform: scale(0.75);
		}
		to {
			opacity: 0.7;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.home-intro,
		.home-intro::before,
		.home-intro::after,
		.home-intro p,
		.home-intro > div::after {
			animation: none;
		}
	}
</style>

<!-- ============ 03 · ABOUT (teal) ============ -->
<Wave fill="teal" size="lg" class="bg-blush" />
<section class="bg-teal text-paper" data-content-section="home.about" data-content-label="Home → About preview">
	<div
		class="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-10 pb-20 md:grid-cols-[0.85fr_1.15fr] md:px-8 md:pt-14 md:pb-28"
	>
		<Reveal>
			<Placeholder label="about photo" src={home.aboutImage.src} alt={home.aboutImage.alt} caption={home.aboutImage.caption} rotation={home.aboutImage.rotation} rotationSeconds={home.aboutImage.rotationSeconds} ratio="4/5" tint="butter" class="arch max-w-sm outline-frame" />
		</Reveal>
		<Reveal delay={120}>
			<div>
				<h2 class="home-section-title font-display">{home.aboutTitle}</h2>
				<p class="mt-6 max-w-md leading-relaxed text-paper/80">
					{home.aboutText}
				</p>
				<a href="/about" class="home-link mt-9 text-paper">{home.aboutLink}</a>
			</div>
		</Reveal>
	</div>
</section>

<!-- ============ 04 · CONTACT (violet) ============ -->
<Wave fill="violet" size="lg" class="bg-teal" />
<section class="bg-violet text-paper" data-content-section="home.contact" data-content-label="Home → Contact callout">
	<div class="mx-auto max-w-6xl px-5 pt-10 pb-24 text-center md:px-8 md:pt-14 md:pb-32">
		<Reveal>
			<h2 class="home-section-title font-display mx-auto max-w-4xl">
				{home.contactTitle}
			</h2>
			<a
				href="/contact"
				class="btn-fun outline-button mt-10 inline-flex items-center gap-2 rounded-full bg-paper px-9 py-4 text-[12px] uppercase tracking-[0.2em] text-ink hover:bg-butter"
			>
				{home.contactButton}
			</a>
		</Reveal>
	</div>
</section>
