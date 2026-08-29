<script lang="ts">
	import { getIdToken } from 'firebase/auth';
	import { onMount } from 'svelte';
	import { auth } from '$lib/firebase/client';

	type AdminSession = {
		id: string;
		email: string;
		ip: string;
		userAgent: string;
		startedAt: string;
		lastSeenAt: string;
		endedAt: string;
		status: string;
		path: string;
	};

	let sessions = $state<AdminSession[]>([]);
	let loading = $state(true);
	let errorMessage = $state('');

	function dateTime(value: string) {
		if (!value) return 'Not recorded';
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(value));
	}

	function sessionStatus(session: AdminSession) {
		if (session.status === 'ended' || session.endedAt) return 'Ended';
		const lastSeen = new Date(session.lastSeenAt || session.startedAt).getTime();
		return Date.now() - lastSeen < 10 * 60 * 1000 ? 'Active' : 'Stale';
	}

	function browserName(userAgent: string) {
		if (!userAgent || userAgent === 'Unavailable') return 'Unknown browser';
		if (userAgent.includes('Edg/')) return 'Microsoft Edge';
		if (userAgent.includes('Firefox/')) return 'Firefox';
		if (userAgent.includes('Chrome/')) return 'Chrome';
		if (userAgent.includes('Safari/')) return 'Safari';
		return 'Other browser';
	}

	async function loadSessions() {
		loading = true;
		errorMessage = '';
		try {
			if (!auth?.currentUser) throw new Error('Your administrator session has expired.');
			const token = await getIdToken(auth.currentUser);
			const response = await fetch('/api/admin/sessions', {
				headers: { authorization: `Bearer ${token}` }
			});
			const result = (await response.json()) as {
				sessions?: AdminSession[];
				message?: string;
			};
			if (!response.ok) throw new Error(result.message || 'Session logs could not be loaded.');
			sessions = result.sessions ?? [];
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Session logs could not be loaded.';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void loadSessions();
	});
</script>

<svelte:head><title>Session logs - Website Studio</title></svelte:head>

<div class="mx-auto max-w-7xl">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="font-display text-5xl">Session logs</h1>
			<p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
				Recent administrator sign-ins and their recorded start, activity, and exit points.
			</p>
		</div>
		<button
			type="button"
			onclick={loadSessions}
			disabled={loading}
			class="rounded-full bg-ink px-6 py-3 text-xs font-semibold text-paper disabled:opacity-50"
		>
			{loading ? 'Loading…' : 'Refresh logs'}
		</button>
	</div>

	{#if errorMessage}
		<p class="mt-6 rounded-2xl bg-blush px-5 py-3 text-sm text-coral">{errorMessage}</p>
	{/if}

	<div class="mt-8 overflow-hidden rounded-[2rem] bg-paper">
		{#if loading}
			<p class="p-8 text-sm text-muted">Loading recent sessions…</p>
		{:else if !sessions.length}
			<p class="p-8 text-sm text-muted">No administrator sessions have been recorded yet.</p>
		{:else}
			<div class="divide-y divide-line">
				{#each sessions as session (session.id)}
					{@const status = sessionStatus(session)}
					<article class="grid gap-5 p-6 md:grid-cols-[1.2fr_0.8fr_1fr_auto] md:items-center md:px-8">
						<div class="min-w-0">
							<div class="flex items-center gap-2">
								<span class="h-2.5 w-2.5 rounded-full {status === 'Active' ? 'bg-teal' : status === 'Stale' ? 'bg-marigold' : 'bg-line'}"></span>
								<p class="truncate text-sm font-semibold">{session.email}</p>
							</div>
							<p class="mt-2 text-xs text-muted">{browserName(session.userAgent)} · {session.path || '/admin'}</p>
							<details class="mt-2">
								<summary class="cursor-pointer text-[11px] text-muted">View user agent</summary>
								<p class="mt-2 break-all rounded-xl bg-mist p-3 text-[10px] leading-relaxed text-muted">{session.userAgent}</p>
							</details>
						</div>
						<div>
							<p class="text-[10px] font-semibold uppercase tracking-wide text-muted">IP address</p>
							<p class="mt-1 text-sm">{session.ip}</p>
						</div>
						<div>
							<p class="text-[10px] font-semibold uppercase tracking-wide text-muted">Started</p>
							<p class="mt-1 text-sm">{dateTime(session.startedAt)}</p>
							<p class="mt-1 text-xs text-muted">
								{status === 'Ended'
									? `Ended ${dateTime(session.endedAt)}`
									: `Last marked ${dateTime(session.lastSeenAt)}`}
							</p>
						</div>
						<span class="w-fit rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase {status === 'Active' ? 'bg-mint text-teal' : status === 'Stale' ? 'bg-butter text-ink' : 'bg-mist text-muted'}">
							{status}
						</span>
					</article>
				{/each}
			</div>
		{/if}
	</div>

	<p class="mt-4 text-xs leading-relaxed text-muted">
		Exit timestamps are best-effort because browsers may close unexpectedly. Sessions without a recent activity mark appear stale after ten minutes.
	</p>
</div>
