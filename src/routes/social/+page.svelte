<script lang="ts">
	import Placeholder from '$lib/components/Placeholder.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import Wave from '$lib/components/Wave.svelte';
	import { pageContent } from '$lib/content/page-content';
	import { rotateMedia } from '$lib/actions/rotate-media';

	const social = $derived($pageContent.social);
	const accents = ['text-coral', 'text-teal', 'text-violet'];
	const reelTints = ['mint', 'lilac', 'blush', 'butter'] as const;
	let visibleReels = $state(10);
	const displayedReels = $derived(social.reels.slice(0, visibleReels));
</script>

<svelte:head>
	<title>{social.seoTitle}</title>
	<link rel="preload" as="image" href={social.background.src} fetchpriority="high" />
</svelte:head>

<section
	class="backdrop-studio relative bg-paper"
	data-content-section="social.hero"
	data-content-label="Social → Hero"
	style:--managed-bg={'url("' + social.background.src + '")'}
	use:rotateMedia={{ media: social.background, background: true }}
>
	<div class="mx-auto max-w-6xl px-5 pt-20 pb-16 md:px-8 md:pt-28 md:pb-20">
		<div class="flex flex-wrap items-end justify-between gap-6">
			<Reveal delay={80}>
				<h1 class="page-display font-display">
					{social.title}<span class="text-teal">.</span>
				</h1>
			</Reveal>
			<Reveal delay={160}>
				<p class="max-w-sm text-sm leading-relaxed text-muted">
					{social.intro}
				</p>
			</Reveal>
		</div>
	</div>
	{#if social.background.caption}
		<p class="absolute bottom-4 right-5 rounded-full bg-ink/60 px-3 py-1.5 text-[10px] text-paper backdrop-blur-sm">
			{social.background.caption}
		</p>
	{/if}
</section>

<section class="mx-auto max-w-6xl px-5 pt-12 md:px-8 md:pt-16" data-content-section="social.background" data-content-label="Social → Background">
	<Reveal>
		<div class="flex items-center gap-4">
			<p class="shrink-0 text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
				{social.backgroundTitle}
			</p>
			<div class="h-px w-full bg-line"></div>
		</div>
	</Reveal>
	<div class="mt-3 border-b border-line">
		{#each social.backgroundItems as item, i (item.title)}
			<Reveal delay={i * 90}>
				<div
					class="grid gap-3 border-t border-line py-7 md:grid-cols-[1fr_2fr_2fr] md:items-center md:gap-8 md:py-8"
				>
					<div class="flex items-center gap-3">
						<span
							class="shrink-0 text-lg font-bold leading-none {accents[i] ?? 'text-coral'}"
							aria-hidden="true">»</span
						>
						<p class="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
							{item.kicker}
						</p>
					</div>
					<h2 class="font-display text-2xl leading-tight md:text-[1.7rem]">{item.title}</h2>
					<p class="max-w-md text-sm leading-relaxed text-ink/60">{item.detail}</p>
				</div>
			</Reveal>
		{/each}
	</div>
</section>

<section class="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24" data-content-section="social.reels" data-content-label="Social → Reels">
	<Reveal>
		<h2 class="page-section-title font-display max-w-3xl">{social.contentTitle}</h2>
	</Reveal>
	<div class="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
		{#each displayedReels as reel, i (`${reel.src}-${i}`)}
			<Reveal delay={i * 80}>
				<div class="page-polaroid group {i % 2 ? 'md:mt-10' : ''}">
					{#if reel.mediaType === 'video'}
						<div
							class="relative aspect-[9/16] overflow-hidden rounded-3xl border border-ink/10 bg-ink outline-frame"
							data-builder-media="Loading dimensions · External · Video"
						>
							<video
								src={reel.src}
								aria-label={reel.alt || reel.caption || `Reel ${i + 1}`}
								controls
								muted
								playsinline
								preload="metadata"
								class="h-full w-full object-cover"
								onloadedmetadata={(event) =>
									event.currentTarget.parentElement?.setAttribute(
										'data-builder-media',
										`${event.currentTarget.videoWidth}×${event.currentTarget.videoHeight} · External · Video`
									)}
							></video>
						</div>
					{:else}
						<Placeholder label={reel.caption || `reel ${i + 1}`} src={reel.src} alt={reel.alt} rotation={reel.rotation} rotationSeconds={reel.rotationSeconds} ratio="9/16" tint={reelTints[i] ?? 'mint'} class="outline-frame" />
					{/if}
					<p class="page-polaroid-caption">{reel.caption}</p>
				</div>
			</Reveal>
		{/each}
	</div>
	{#if visibleReels < social.reels.length}
		<div class="mt-12 text-center">
			<button
				type="button"
				onclick={() => (visibleReels += 10)}
				class="rounded-full border border-teal bg-paper px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-teal transition-colors hover:bg-teal hover:text-paper"
			>
				Load 10 more reels
			</button>
		</div>
	{/if}
</section>

<section data-content-section="social.services" data-content-label="Social → Services">
	<div class="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
		<Reveal>
			<h2 class="page-section-title font-display max-w-3xl">{social.servicesTitle}</h2>
		</Reveal>
		<ul class="mt-12 divide-y divide-line border-y border-line">
			{#each social.services as cs, i (cs.name)}
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
						</a>
					</Reveal>
				</li>
			{/each}
		</ul>
	</div>
</section>

<div>
	<Wave fill="mint" size="lg" class="bg-paper" />
	<section class="bg-mint" data-content-section="social.cta" data-content-label="Social → Contact callout">
		<div
			class="mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 pt-10 pb-24 md:flex-row md:items-center md:justify-between md:px-8 md:pt-14 md:pb-28"
		>
			<Reveal>
				<div>
					<h2 class="page-section-title font-display max-w-3xl">
						{social.ctaTitle}
					</h2>
					<p class="mt-4 text-sm text-ink/60">
						{social.ctaText}
					</p>
				</div>
			</Reveal>
			<Reveal delay={100}>
				<a
					href="/contact"
					class="btn-fun inline-flex items-center gap-2 rounded-full border border-teal bg-teal px-7 py-3.5 text-[12px] uppercase tracking-[0.2em] text-paper hover:border-ink hover:bg-ink"
				>
					{social.ctaButton}
				</a>
			</Reveal>
		</div>
	</section>
</div>
