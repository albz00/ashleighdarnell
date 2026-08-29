<script lang="ts">
	import type { PageSectionBlock, SectionSurface } from '$lib/content/page-content';
	import Reveal from './Reveal.svelte';

	let {
		block,
		page
	}: {
		block: PageSectionBlock;
		page: 'photography' | 'social';
	} = $props();

	const surfaceClasses: Record<SectionSurface, string> = {
		paper: 'bg-paper',
		mist: 'bg-mist',
		blush: 'bg-blush',
		butter: 'bg-butter',
		mint: 'bg-mint',
		lilac: 'bg-lilac'
	};
	const accent = $derived(page === 'photography' ? 'coral' : 'teal');
</script>

<section
	class="border-t border-line {surfaceClasses[block.surface]}"
	data-content-section={`${page}.sections.${block.id}`}
	data-content-label={`${page === 'photography' ? 'Photography' : 'Social'} → ${block.title || 'Additional section'}`}
>
	<div class="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
		<Reveal>
			<div class="flex flex-wrap items-end justify-between gap-6">
				<div class="max-w-3xl">
					<p class="text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
						{block.type === 'pricing' ? 'Packages & pricing' : 'More to explore'}
					</p>
					<h2 class="page-section-title font-display mt-3">{block.title}</h2>
					{#if block.intro}
						<p class="mt-4 max-w-2xl text-sm leading-relaxed text-ink/65">{block.intro}</p>
					{/if}
				</div>
				{#if block.buttonLabel}
					<a
						href="/contact"
						class="btn-fun inline-flex rounded-full px-6 py-3 text-xs font-semibold text-paper {accent === 'coral' ? 'bg-coral' : 'bg-teal'}"
					>
						{block.buttonLabel}
					</a>
				{/if}
			</div>
		</Reveal>

		<div class="mt-10 grid gap-5 {block.items.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : ''}">
			{#each block.items as item, index (item.id)}
				<Reveal delay={index * 70}>
					<article
						class="h-full rounded-2xl border border-line bg-paper p-6 md:p-7"
					>
						<h3 class="font-display text-2xl leading-tight">{item.title}</h3>
						{#if block.type === 'pricing' && item.price}
							<p class="font-display mt-3 text-3xl leading-none {accent === 'coral' ? 'text-coral' : 'text-teal'}">
								{item.price}
							</p>
						{/if}
						{#if item.text}
							<p class="mt-4 text-sm leading-relaxed text-ink/65">{item.text}</p>
						{/if}
						{#if block.type === 'pricing' && item.features.length}
							<ul class="mt-6 space-y-3 border-t border-line pt-5">
								{#each item.features as feature}
									<li class="flex gap-3 text-sm text-ink/70">
										<span class={accent === 'coral' ? 'text-coral' : 'text-teal'} aria-hidden="true">•</span>
										<span>{feature}</span>
									</li>
								{/each}
							</ul>
						{/if}
					</article>
				</Reveal>
			{/each}
		</div>
	</div>
</section>
