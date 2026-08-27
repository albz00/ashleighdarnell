<script lang="ts">
	import Photo from '$lib/components/Photo.svelte';
	import Reveal from '$lib/components/Reveal.svelte';
	import Wave from '$lib/components/Wave.svelte';
	import { pageContent } from '$lib/content/page-content';
	import { posts } from '$lib/content/site';

	const blog = $derived($pageContent.blog);
	const published = $derived(
		$posts
			.filter((post) => post.status === 'published')
			.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
	);
	const featured = $derived(published.find((post) => post.featured) ?? published[0]);
</script>

<svelte:head>
	<title>{blog.seoTitle}</title>
	<meta name="description" content={blog.seoDescription} />
</svelte:head>

<section class="backdrop-mountains bg-paper">
	<div class="mx-auto max-w-6xl px-5 pb-16 pt-20 md:px-8 md:pb-20 md:pt-28">
		<Reveal>
			<p class="home-kicker text-coral">{blog.kicker}</p>
			<h1 class="page-display font-display mt-5 max-w-4xl">
				{blog.titleBefore} <span class="font-cursive text-[1.15em] text-coral">{blog.titleAccent}</span>
			</h1>
			<p class="mt-6 max-w-xl leading-relaxed text-muted">
				{blog.intro}
			</p>
		</Reveal>
	</div>
</section>

{#if featured}
	<section class="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
		<Reveal>
			<a
				href="/blog/{featured.slug}"
				class="card-lift group grid overflow-hidden rounded-[2.5rem] bg-blush md:grid-cols-[1.2fr_0.8fr]"
			>
				<Photo
					src={featured.cover}
					alt={featured.alt}
					rotation={featured.coverRotation}
					rotationSeconds={featured.coverRotationSeconds}
					ratio="16/11"
					loading="eager"
					class="h-full min-h-80 rounded-none"
				/>
				<div class="flex flex-col justify-center p-8 md:p-12">
					<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-coral">
						{blog.featuredLabel} · {featured.category}
					</p>
					<h2 class="font-display mt-5 text-4xl leading-tight md:text-5xl">{featured.title}</h2>
					<p class="mt-4 leading-relaxed text-muted">{featured.excerpt}</p>
					<span class="home-link mt-8 w-fit">{blog.readLabel}</span>
				</div>
			</a>
		</Reveal>
	</section>
{/if}

<Wave fill="mist" size="lg" class="bg-paper" />
<section class="bg-mist">
	<div class="mx-auto max-w-6xl px-5 pb-24 pt-10 md:px-8 md:pb-28 md:pt-14">
		<Reveal><h2 class="page-section-title font-display">{blog.recentTitle}</h2></Reveal>
		<div class="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each published.filter((post) => post.id !== featured?.id) as post, index (post.id)}
				<Reveal delay={(index % 3) * 80}>
					<a href="/blog/{post.slug}" class="card-lift group block h-full">
						<Photo src={post.cover} alt={post.alt} rotation={post.coverRotation} rotationSeconds={post.coverRotationSeconds} ratio="4/3" class="rounded-[2rem]" />
						{#if post.coverCaption}<p class="mt-2 text-xs text-muted">{post.coverCaption}</p>{/if}
						<p class="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-coral">
							{post.category} · {new Date(`${post.publishedAt}T12:00:00`).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
								year: 'numeric'
							})}
						</p>
						<h3 class="font-display mt-3 text-3xl leading-tight">{post.title}</h3>
						<p class="mt-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
					</a>
				</Reveal>
			{/each}
		</div>
	</div>
</section>
