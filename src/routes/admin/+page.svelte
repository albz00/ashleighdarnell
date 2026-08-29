<script lang="ts">
	import { onMount } from 'svelte';
	import { getIdToken } from 'firebase/auth';
	import { banners, campaigns, posts, subscribers } from '$lib/content/site';
	import { auth } from '$lib/firebase/client';

	type Analytics = {
		period: string;
		summary: {
			visits: number;
			visitors: number;
			pageviews: number;
			bounceRate: string;
			averageVisitSeconds: number;
		};
		pages: Array<{ label: string; views: number }>;
		referrers: Array<{ label: string; visits: number }>;
	};

	const activeReaders = $derived($subscribers.filter((subscriber) => subscriber.status === 'active'));
	const publishedPosts = $derived($posts.filter((post) => post.status === 'published'));
	const activeBanner = $derived($banners.find((banner) => banner.active));
	const recentPosts = $derived([...$posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 4));
	let analytics = $state<Analytics | null>(null);
	let analyticsLoading = $state(true);
	let analyticsError = $state('');
	let reportModal = $state(false);
	let reportEnabled = $state(true);
	let reportEmail = $state('');
	let reportFrequency = $state<'day' | 'week' | 'month'>('week');
	let reportHour = $state(9);
	let reportSaving = $state(false);
	let reportNotice = $state('');

	function duration(seconds: number) {
		const minutes = Math.floor(seconds / 60);
		const remainder = Math.round(seconds % 60);
		return minutes ? `${minutes}m ${remainder}s` : `${remainder}s`;
	}

	async function loadAnalytics() {
		analyticsLoading = true;
		analyticsError = '';
		try {
			const user = auth?.currentUser;
			if (!user) throw new Error('Sign in to view analytics.');
			const token = await getIdToken(user);
			const response = await fetch('/api/admin/analytics', {
				headers: { authorization: `Bearer ${token}` }
			});
			const result = (await response.json()) as Analytics & { message?: string };
			if (!response.ok) throw new Error(result.message || 'Analytics could not be loaded.');
			analytics = result;
		} catch (error) {
			analyticsError = error instanceof Error ? error.message : 'Analytics could not be loaded.';
		} finally {
			analyticsLoading = false;
		}
	}

	async function scheduleReport() {
		reportSaving = true;
		reportNotice = '';
		try {
			const user = auth?.currentUser;
			if (!user) throw new Error('Sign in to schedule reports.');
			const token = await getIdToken(user);
			const response = await fetch('/api/admin/analytics', {
				method: 'POST',
				headers: {
					authorization: `Bearer ${token}`,
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					enabled: reportEnabled,
					email: reportEmail,
					frequency: reportFrequency,
					hour: reportHour
				})
			});
			const result = (await response.json()) as { success?: boolean; message?: string };
			if (!response.ok) throw new Error(result.message || 'The report could not be scheduled.');
			reportNotice = `Report scheduled for ${reportEmail}.`;
		} catch (error) {
			reportNotice = error instanceof Error ? error.message : 'The report could not be scheduled.';
		} finally {
			reportSaving = false;
		}
	}

	onMount(loadAnalytics);
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

	<section class="mt-8 rounded-[2rem] bg-paper p-6 md:p-8">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h2 class="font-display text-3xl">Website activity</h2>
				<p class="mt-1 text-sm text-muted">{analytics?.period ?? 'Last 30 days'} · Ashleigh’s site only</p>
			</div>
			<div class="flex items-center gap-3">
				<button
					type="button"
					onclick={loadAnalytics}
					disabled={analyticsLoading}
					class="rounded-full bg-mist px-5 py-2.5 text-xs font-semibold text-ink"
				>
					{analyticsLoading ? 'Loading…' : 'Refresh'}
				</button>
				<button
					type="button"
					onclick={() => {
						reportModal = true;
						reportNotice = '';
					}}
					class="rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-paper"
				>
					Schedule reports
				</button>
			</div>
		</div>

		{#if analyticsError}
			<p class="mt-6 rounded-2xl bg-blush px-5 py-4 text-sm text-coral">{analyticsError}</p>
		{:else if analyticsLoading && !analytics}
			<div class="mt-7 grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{#each Array(4) as _}
					<div class="h-28 rounded-3xl bg-mist"></div>
				{/each}
			</div>
		{:else if analytics}
			<div class="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{#each [
					{ label: 'Visits', value: analytics.summary.visits.toLocaleString(), note: `${analytics.summary.visitors.toLocaleString()} unique visitors`, tint: 'bg-blush' },
					{ label: 'Pageviews', value: analytics.summary.pageviews.toLocaleString(), note: 'Tracked page actions', tint: 'bg-mint' },
					{ label: 'Avg. visit', value: duration(analytics.summary.averageVisitSeconds), note: 'Time on the website', tint: 'bg-butter' },
					{ label: 'Bounce rate', value: analytics.summary.bounceRate, note: 'Single-page visits', tint: 'bg-lilac' }
				] as metric}
					<div class="relative overflow-hidden rounded-3xl border border-line p-5">
						<div class="absolute -right-7 -top-7 h-24 w-24 rounded-full opacity-70 {metric.tint}"></div>
						<div class="relative">
							<p class="text-sm font-semibold text-muted">{metric.label}</p>
							<p class="mt-4 text-4xl font-bold tracking-[-0.04em] tabular-nums">{metric.value}</p>
							<p class="mt-2 text-xs text-muted">{metric.note}</p>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-7 grid gap-5 lg:grid-cols-2">
				<div class="rounded-3xl bg-mist p-5">
					<h3 class="font-display text-2xl">Popular pages</h3>
					<div class="mt-4 divide-y divide-line">
						{#each analytics.pages as item, index}
							<div class="flex items-center gap-4 py-3">
								<span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-paper text-xs font-semibold">{index + 1}</span>
								<p class="min-w-0 flex-1 truncate text-sm">{item.label}</p>
								<p class="text-sm font-semibold tabular-nums">{item.views.toLocaleString()}</p>
							</div>
						{:else}
							<p class="py-4 text-sm text-muted">No page activity yet.</p>
						{/each}
					</div>
				</div>

				<div class="rounded-3xl bg-mist p-5">
					<h3 class="font-display text-2xl">Traffic sources</h3>
					<div class="mt-4 divide-y divide-line">
						{#each analytics.referrers as item}
							<div class="flex items-center gap-4 py-3">
								<span class="h-2.5 w-2.5 shrink-0 rounded-full bg-teal"></span>
								<p class="min-w-0 flex-1 truncate text-sm">{item.label}</p>
								<p class="text-sm font-semibold tabular-nums">{item.visits.toLocaleString()}</p>
							</div>
						{:else}
							<p class="py-4 text-sm text-muted">No referral activity yet.</p>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</section>

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

{#if reportModal}
	<div class="fixed inset-0 z-50 overflow-y-auto bg-ink/55 p-4 md:p-8">
		<button
			type="button"
			class="admin-no-feedback fixed inset-0 h-full w-full cursor-default"
			aria-label="Close report scheduler"
			onclick={() => (reportModal = false)}
		></button>
		<div
			class="relative mx-auto mt-10 max-w-xl rounded-[2rem] bg-paper p-6 shadow-2xl md:p-8"
			role="dialog"
			aria-modal="true"
			aria-labelledby="report-scheduler-title"
		>
			<div class="flex items-start justify-between gap-5">
				<div>
					<h2 id="report-scheduler-title" class="font-display text-3xl">Schedule reports</h2>
					<p class="mt-2 text-sm leading-relaxed text-muted">
						Send Ashleigh’s website analytics automatically by email.
					</p>
				</div>
				<button
					type="button"
					onclick={() => (reportModal = false)}
					class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist text-lg"
					aria-label="Close report scheduler"
				>×</button>
			</div>

			<form
				class="mt-7 space-y-5"
				onsubmit={(event) => {
					event.preventDefault();
					scheduleReport();
				}}
			>
				<div class="flex items-center justify-between gap-5 rounded-2xl bg-mist p-4">
					<div>
						<p class="text-sm font-semibold">Turn on scheduled reports</p>
						<p class="mt-1 text-xs text-muted">Matomo will prepare and send each report.</p>
					</div>
					<button
						type="button"
						onclick={() => (reportEnabled = !reportEnabled)}
						class="relative h-8 w-14 shrink-0 rounded-full transition-colors {reportEnabled ? 'bg-teal' : 'bg-line'}"
						aria-label="Toggle scheduled reports"
						aria-pressed={reportEnabled}
					>
						<span class="absolute top-1 h-6 w-6 rounded-full bg-paper shadow transition-all {reportEnabled ? 'left-7' : 'left-1'}"></span>
					</button>
				</div>

				<label class="block">
					<span class="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Send to</span>
					<input
						type="email"
						bind:value={reportEmail}
						required
						placeholder="ashleigh@example.com"
						autocomplete="email"
						class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3 outline-none focus:border-coral"
					/>
				</label>

				<div class="grid gap-5 sm:grid-cols-2">
					<label class="block">
						<span class="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Frequency</span>
						<select
							bind:value={reportFrequency}
							class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3 outline-none focus:border-coral"
						>
							<option value="day">Daily</option>
							<option value="week">Weekly</option>
							<option value="month">Monthly</option>
						</select>
					</label>

					<label class="block">
						<span class="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Send around</span>
						<select
							bind:value={reportHour}
							class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3 outline-none focus:border-coral"
						>
							{#each Array.from({ length: 24 }, (_, hour) => hour) as hour}
								<option value={hour}>
									{new Intl.DateTimeFormat('en-US', { hour: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(2020, 0, 1, hour)))} UTC
								</option>
							{/each}
						</select>
					</label>
				</div>

				{#if reportNotice}
					<p class="rounded-2xl bg-butter px-4 py-3 text-sm" aria-live="polite">{reportNotice}</p>
				{/if}

				<div class="flex justify-end gap-3 border-t border-line pt-5">
					<button
						type="button"
						onclick={() => (reportModal = false)}
						class="rounded-full bg-mist px-6 py-3 text-xs font-semibold"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={!reportEnabled || reportSaving}
						class="rounded-full bg-coral px-6 py-3 text-xs font-semibold text-paper disabled:opacity-45"
					>
						{reportSaving ? 'Scheduling…' : 'Schedule report'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
