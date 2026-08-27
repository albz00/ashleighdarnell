<script lang="ts">
	import Placeholder from '$lib/components/Placeholder.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import Wave from '$lib/components/Wave.svelte';
	import { pageContent } from '$lib/content/page-content';

	const home = $derived($pageContent.home);
</script>

<svelte:head>
	<title>{home.seoTitle}</title>
	<meta name="description" content={home.seoDescription} />
</svelte:head>

<!-- ============ 01 · HERO ============ -->
<section
	class="hero-story backdrop-mountains relative overflow-hidden bg-paper"
	style:--managed-bg={'url("' + home.background.src + '")'}
>
	<div class="hero-backdrop" aria-hidden="true">
		<Placeholder
			label="portrait"
			src={home.backdrops[0].src}
			alt={home.backdrops[0].alt}
			ratio="4/5"
			tint="blush"
			class="hero-backdrop-photo hero-backdrop-photo-a"
		/>
		<Placeholder
			label="detail"
			src={home.backdrops[1].src}
			alt={home.backdrops[1].alt}
			ratio="1/1"
			tint="butter"
			class="hero-backdrop-photo hero-backdrop-photo-b"
		/>
		<Placeholder
			label="studio"
			src={home.backdrops[2].src}
			alt={home.backdrops[2].alt}
			ratio="3/4"
			tint="mint"
			class="hero-backdrop-photo hero-backdrop-photo-c"
		/>
		<Placeholder
			label="editorial"
			src={home.backdrops[3].src}
			alt={home.backdrops[3].alt}
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
						ratio="4/5"
						tint="butter"
						class="hero-card-media outline-frame"
					/>
					<p class="hero-polaroid-caption">{home.gallery[2].caption}</p>
				</div>
			</div>
		</Reveal>
	</div>
</section>

<!-- ============ 02 · WHAT I CREATE (blush) ============ -->
<Wave fill="blush" size="lg" class="bg-paper" />
<section class="bg-blush">
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
					<Placeholder label="photography cover" src={home.services[0].image.src} alt={home.services[0].image.alt} ratio="16/10" tint="blush" class="arch-soft outline-frame" />
					<h3 class="font-display mt-6 text-2xl">{home.services[0].title}</h3>
					<p class="mt-2 text-sm text-paper/75">
						{home.services[0].text}
					</p>
				</a>
			</Reveal>

			<Reveal delay={180}>
				<a href={home.services[1].href} class="card-lift group block rounded-[2.5rem] bg-marigold p-6">
					<Placeholder label="social media cover" src={home.services[1].image.src} alt={home.services[1].image.alt} ratio="16/10" tint="mint" class="arch-soft outline-frame" />
					<h3 class="font-display mt-6 text-2xl">{home.services[1].title}</h3>
					<p class="mt-2 text-sm text-ink/70">
						{home.services[1].text}
					</p>
				</a>
			</Reveal>
		</div>
	</div>
</section>

<!-- ============ 03 · ABOUT (teal) ============ -->
<Wave fill="teal" size="lg" class="bg-blush" />
<section class="bg-teal text-paper">
	<div
		class="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-10 pb-20 md:grid-cols-[0.85fr_1.15fr] md:px-8 md:pt-14 md:pb-28"
	>
		<Reveal>
			<Placeholder label="about photo" src={home.aboutImage.src} alt={home.aboutImage.alt} ratio="4/5" tint="butter" class="arch max-w-sm outline-frame" />
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
<section class="bg-violet text-paper">
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
