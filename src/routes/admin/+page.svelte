<script lang="ts">
	import { banners, campaigns, posts, subscribers } from '$lib/content/site';

	const activeReaders = $derived($subscribers.filter((subscriber) => subscriber.status === 'active'));
	const publishedPosts = $derived($posts.filter((post) => post.status === 'published'));
	const activeBanner = $derived($banners.find((banner) => banner.active));
	const recentPosts = $derived([...$posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 4));
</script>

<svelte:head><title>Dashboard - Website Studio</title></svelte:head>

<div class="mx-auto max-w-7xl">
	<div class="flex flex-wrap items-end justify-between gap-5">
		<div>
			<h1 class="font-display text-4xl md:text-5xl">Good afternoon, Ashleigh</h1>
			<p class="mt-3 text-muted">Here’s what is happening around your website.</p>
		</div>
		<a href="/admin/blog" class="btn-fun rounded-full bg-coral px-6 py-3 text-sm font-semibold text-paper">
			Write a post
		</a>
	</div>

	<div class="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each [
			{ label: 'Published stories', value: publishedPosts.length, note: `${$posts.length - publishedPosts.length} drafts`, href: '/admin/blog', accent: 'bg-coral', tint: 'bg-blush text-coral' },
			{ label: 'Newsletter readers', value: activeReaders.length, note: 'Active subscribers', href: '/admin/newsletter', accent: 'bg-teal', tint: 'bg-mint text-teal' },
			{ label: 'Campaigns', value: $campaigns.length, note: `${$campaigns.filter((item) => item.status === 'draft').length} drafts`, href: '/admin/newsletter', accent: 'bg-marigold', tint: 'bg-butter text-ink' },
			{ label: 'Live banners', value: activeBanner ? 1 : 0, note: activeBanner ? 'Visible now' : 'None active', href: '/admin/banners', accent: 'bg-violet', tint: 'bg-lilac text-violet' }
		] as stat}
			<a
				href={stat.href}
				class="group relative overflow-hidden rounded-3xl border border-line bg-paper transition duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-[0_16px_40px_color-mix(in_srgb,var(--color-ink)_9%,transparent)]"
			>
				<div class="h-1.5 {stat.accent}"></div>
				<div class="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-45 {stat.tint}"></div>
				<div class="relative p-6">
					<p class="text-sm font-semibold text-muted">{stat.label}</p>
					<div class="mt-6 flex items-end justify-between gap-4">
						<p class="text-5xl font-bold leading-none tracking-[-0.05em] tabular-nums">{stat.value}</p>
						<span class="rounded-full px-3 py-1 text-[10px] font-semibold {stat.tint}">{stat.note}</span>
					</div>
					<div class="mt-6 flex items-center justify-between border-t border-line pt-4">
						<span class="text-xs text-muted">View details</span>
						<span class="text-sm text-muted transition-transform group-hover:translate-x-1">→</span>
					</div>
				</div>
			</a>
		{/each}
	</div>

	<div class="mt-8 grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
		<section class="rounded-[2rem] bg-paper p-6 md:p-8">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="font-display text-3xl">Recent stories</h2>
					<p class="mt-1 text-sm text-muted">Published posts and works in progress.</p>
				</div>
				<a href="/admin/blog" class="text-xs font-semibold text-coral">View all →</a>
			</div>
			<div class="mt-6 divide-y divide-line">
				{#each recentPosts as post}
					<a href="/admin/blog" class="flex items-center gap-4 py-4">
						<img src={post.cover} alt="" class="h-14 w-14 rounded-2xl object-cover" />
						<div class="min-w-0 flex-1">
							<p class="truncate font-semibold">{post.title}</p>
							<p class="mt-1 text-xs text-muted">{post.category} · {post.publishedAt}</p>
						</div>
						<span class="rounded-full px-3 py-1 text-[10px] font-semibold uppercase {post.status === 'published' ? 'bg-mint text-teal' : 'bg-butter text-ink'}">
							{post.status}
						</span>
					</a>
				{/each}
			</div>
		</section>

	<section class="rounded-[2rem] bg-ink p-7 text-paper">
			<h2 class="font-display text-3xl">Current announcement</h2>
			{#if activeBanner}
				<div class="mt-6 rounded-2xl bg-paper/10 p-5">
					<p class="leading-relaxed">{activeBanner.message}</p>
					<p class="mt-3 text-xs text-paper/50">{activeBanner.linkLabel} →</p>
				</div>
			{:else}
				<p class="mt-6 text-sm text-paper/60">No banner is visible right now.</p>
			{/if}
			<a href="/admin/banners" class="mt-7 inline-flex rounded-full bg-paper px-5 py-2.5 text-xs font-semibold text-ink">
				Manage banners
			</a>
		</section>
	</div>

	<p class="mt-6 text-center text-xs text-muted">Connected to the server · Saved changes sync to the public site</p>
</div>
