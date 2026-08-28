<script lang="ts">
	import { page } from '$app/state';
	import Photo from '$lib/components/Photo.svelte';
	import { pageContent } from '$lib/content/page-content';
	import { posts } from '$lib/content/site';

	const blog = $derived($pageContent.blog);
	const global = $derived($pageContent.global);
	const post = $derived(
		$posts.find((item) => item.slug === page.params.slug && item.status === 'published')
	);
	const related = $derived(
		$posts.filter((item) => item.status === 'published' && item.slug !== page.params.slug).slice(0, 2)
	);
</script>

<svelte:head>
	<title>{post
			? `${post.title} - ${global.firstName} ${global.lastName}`
			: `${blog.notFoundTitle} - ${global.firstName} ${global.lastName}`}</title>
	{#if post}<meta name="description" content={post.excerpt} />{/if}
</svelte:head>

{#if post}
	<article>
		<header class="mx-auto max-w-4xl px-5 pb-12 pt-20 text-center md:px-8 md:pb-16 md:pt-28">
			<a href="/blog" class="text-[11px] font-semibold uppercase tracking-[0.2em] text-coral">
				← {blog.backLabel}
			</a>
			<p class="mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
				{post.category} · {new Date(`${post.publishedAt}T12:00:00`).toLocaleDateString('en-US', {
					month: 'long',
					day: 'numeric',
					year: 'numeric'
				})}
			</p>
			<h1 class="page-display font-display mt-5">{post.title}</h1>
			<p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">{post.excerpt}</p>
		</header>

		<div class="mx-auto max-w-6xl px-5 md:px-8">
			<Photo src={post.cover} alt={post.alt} rotation={post.coverRotation} rotationSeconds={post.coverRotationSeconds} ratio="16/8" loading="eager" fetchpriority="high" class="rounded-[2.5rem]" />
			{#if post.coverCaption}<p class="mt-3 text-center text-sm text-muted">{post.coverCaption}</p>{/if}
		</div>

		<div class="mx-auto max-w-2xl px-5 py-14 md:px-8 md:py-20">
			{#each post.body.split('\n\n') as paragraph}
				<p class="mb-7 text-lg leading-[1.85] text-ink/80">{paragraph}</p>
			{/each}
		</div>
	</article>

	<section class="bg-mist">
		<div class="mx-auto max-w-6xl px-5 py-20 md:px-8">
			<h2 class="font-display text-4xl">{blog.relatedTitle}</h2>
			<div class="mt-10 grid gap-8 md:grid-cols-2">
				{#each related as item (item.id)}
					<a href="/blog/{item.slug}" class="group grid grid-cols-[8rem_1fr] items-center gap-5">
						<Photo src={item.cover} alt={item.alt} rotation={item.coverRotation} rotationSeconds={item.coverRotationSeconds} ratio="1/1" class="rounded-3xl" />
						<div>
							<p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-coral">{item.category}</p>
							<h3 class="font-display mt-2 text-2xl leading-tight">{item.title}</h3>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>
{:else}
	<section class="mx-auto max-w-3xl px-5 py-32 text-center">
		<p class="home-kicker text-coral">404</p>
		<h1 class="page-display font-display mt-5">{blog.notFoundTitle}</h1>
		<p class="mt-5 text-muted">{blog.notFoundText}</p>
		<a href="/blog" class="btn-fun mt-8 inline-flex rounded-full bg-coral px-7 py-3 text-sm text-paper">
			{blog.notFoundButton}
		</a>
	</section>
{/if}
