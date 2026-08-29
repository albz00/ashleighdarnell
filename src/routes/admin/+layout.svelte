<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getIdToken, signOut, type User } from 'firebase/auth';
	import { onMount } from 'svelte';
	import { auth, authState } from '$lib/firebase/client';
	import { firebaseConnection } from '$lib/firebase/repository';

	let { children } = $props();
	let mobileOpen = $state(false);
	let sessionId = $state('');
	let sessionToken = '';
	let trackedUid = '';
	let sessionActive = $state(false);
	let sessionError = $state('');

	const isLogin = $derived(page.url.pathname === '/admin/login');
	const links = [
		{ href: '/admin', label: 'Overview' },
		{ href: '/admin/content', label: 'Content' },
		{ href: '/admin/blog', label: 'Blog posts' },
		{ href: '/admin/newsletter', label: 'Newsletter' },
		{ href: '/admin/banners', label: 'Banners' },
		{ href: '/admin/fonts', label: 'Fonts' },
		{ href: '/admin/theme', label: 'Site theme' }
	];

	$effect(() => {
		if (
			browser &&
			!isLogin &&
			!$authState.loading &&
			!$authState.user &&
			!$authState.retryable
		) {
			void goto('/admin/login', { replaceState: true });
		}
	});

	async function sessionRequest(action: 'start' | 'touch' | 'end', keepalive = false) {
		if (!auth?.currentUser || !sessionId) return;
		const token = keepalive ? sessionToken : await getIdToken(auth.currentUser);
		if (!token) return;
		sessionToken = token;
		const response = await fetch('/api/admin/sessions', {
			method: 'POST',
			keepalive,
			headers: {
				authorization: `Bearer ${token}`,
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				action,
				sessionId,
				path: page.url.pathname
			})
		});
		if (!response.ok) throw new Error('Session activity could not be recorded.');
	}

	async function startSession(user: User) {
		trackedUid = user.uid;
		sessionId = `admin-${crypto.randomUUID()}`;
		sessionActive = false;
		sessionError = '';
		try {
			await sessionRequest('start');
			sessionActive = true;
		} catch (error) {
			sessionError = error instanceof Error ? error.message : 'Session logging is unavailable.';
		}
	}

	$effect(() => {
		const user = $authState.user;
		if (browser && user && trackedUid !== user.uid) void startSession(user);
	});

	$effect(() => {
		page.url.pathname;
		if (browser && sessionActive) void sessionRequest('touch').catch(() => {});
	});

	onMount(() => {
		const heartbeat = window.setInterval(() => {
			if (sessionActive) void sessionRequest('touch').catch(() => {});
		}, 5 * 60 * 1000);
		const endSession = () => {
			if (sessionActive) void sessionRequest('end', true).catch(() => {});
		};
		window.addEventListener('pagehide', endSession);
		return () => {
			window.clearInterval(heartbeat);
			window.removeEventListener('pagehide', endSession);
			endSession();
		};
	});

	async function logout() {
		if (sessionActive) {
			await sessionRequest('end').catch(() => {});
			sessionActive = false;
		}
		if (auth) await signOut(auth);
		await goto('/admin/login');
	}
</script>

{#if isLogin}
	{@render children()}
{:else if $authState.loading}
	<div class="grid min-h-screen place-items-center bg-mist">
		<div class="text-center">
			<div class="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-line border-t-coral"></div>
			<p class="mt-4 text-sm text-muted">Checking your session…</p>
			{#if $authState.error}
				<p class="mt-2 max-w-sm text-xs text-coral">{$authState.error}</p>
			{/if}
		</div>
	</div>
{:else if $authState.retryable && !$authState.user}
	<div class="grid min-h-screen place-items-center bg-mist px-5">
		<div class="max-w-md rounded-[2rem] bg-paper p-8 text-center shadow-sm">
			<h1 class="font-display text-3xl">Session check paused</h1>
			<p class="mt-3 text-sm leading-relaxed text-muted">
				{$authState.error || 'The administrator session could not be verified.'}
			</p>
			<div class="mt-6 flex justify-center gap-3">
				<button
					type="button"
					onclick={() => window.location.reload()}
					class="rounded-full bg-coral px-6 py-3 text-xs font-semibold text-paper"
				>
					Retry
				</button>
				<button
					type="button"
					onclick={logout}
					class="rounded-full bg-mist px-6 py-3 text-xs font-semibold text-ink"
				>
					Sign out
				</button>
			</div>
		</div>
	</div>
{:else if $authState.user}
	<div class="admin-shell min-h-screen bg-mist lg:grid lg:grid-cols-[17rem_1fr]">
		{#if mobileOpen}
			<button
				class="admin-no-feedback fixed inset-0 z-30 bg-ink/30 lg:hidden"
				aria-label="Close navigation"
				onclick={() => (mobileOpen = false)}
			></button>
		{/if}
		<aside
			class="fixed inset-y-0 left-0 z-40 flex w-[17rem] flex-col bg-ink p-5 text-paper transition-transform lg:sticky lg:top-0 lg:h-screen {mobileOpen
				? 'translate-x-0'
				: '-translate-x-full lg:translate-x-0'}"
		>
			<a href="/" class="rounded-3xl bg-paper/10 p-5">
				<p class="font-display text-2xl">Ashleigh <span class="font-cursive text-4xl text-coral">Darnell</span></p>
			</a>
			<nav class="mt-9 flex-1">
				<ul class="space-y-1.5">
					{#each links as link}
						<li>
							<a
								href={link.href}
								onclick={() => (mobileOpen = false)}
								class="block rounded-2xl px-4 py-3 text-sm transition-colors {page.url.pathname ===
								link.href
									? 'bg-paper text-ink'
									: 'text-paper/70 hover:bg-paper/10 hover:text-paper'}"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
			<div class="border-t border-paper/10 pt-5">
				<a href="/" class="block px-3 py-2 text-sm text-paper/60 hover:text-paper">View live site ↗</a>
				<button type="button" onclick={logout} class="mt-1 px-3 py-2 text-sm text-paper/60 hover:text-paper">
					Log out
				</button>
			</div>
		</aside>
		<div class="min-w-0">
			<header class="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-line bg-paper/90 px-5 backdrop-blur md:px-8">
				<button
					type="button"
					class="grid h-10 w-10 place-items-center rounded-full bg-ink text-paper lg:hidden"
					onclick={() => (mobileOpen = true)}
					aria-label="Open navigation"
				>☰</button>
				<details class="group relative ml-auto">
					<summary class="flex cursor-pointer list-none items-center gap-3 rounded-full">
						<p class="max-w-52 truncate text-sm font-semibold">
							{$authState.user.displayName || $authState.user.email || 'Administrator'}
						</p>
						<span class="profile-avatar-shell">
							{#if $authState.user.photoURL}
								<img
									src={$authState.user.photoURL}
									alt={$authState.user.displayName || 'Administrator'}
									referrerpolicy="no-referrer"
									class="h-10 w-10 rounded-full border-2 border-paper object-cover shadow-sm"
								/>
							{:else}
								<span class="grid h-10 w-10 place-items-center rounded-full bg-coral font-display text-paper">
									{($authState.user.displayName || $authState.user.email || 'A').charAt(0).toUpperCase()}
								</span>
							{/if}
							<span class="profile-orbit" aria-hidden="true"></span>
						</span>
					</summary>
					<div class="absolute right-0 top-full z-30 mt-3 w-72 rounded-2xl border border-line bg-paper p-5 shadow-xl">
						<p class="text-xs text-muted">Signed in as</p>
						<p class="mt-1 break-all text-sm font-semibold">{$authState.user.email}</p>
						<div class="mt-4 border-t border-line pt-3">
							<a
								href="/admin/sessions"
								class="group/session flex items-center justify-between gap-3 rounded-xl p-3 text-sm font-semibold transition-all hover:bg-mist hover:text-coral"
							>
								<span class="flex items-center gap-2">
									<span class="h-2.5 w-2.5 rounded-full transition-transform group-hover/session:scale-125 {sessionActive ? 'bg-teal' : sessionError ? 'bg-coral' : 'bg-marigold'}"></span>
									Session logs
								</span>
								<span class="transition-transform group-hover/session:translate-x-1" aria-hidden="true">→</span>
							</a>
						</div>
					</div>
				</details>
			</header>
			{#if $firebaseConnection.error}
				<p class="mx-5 mt-5 rounded-2xl bg-blush px-5 py-3 text-sm text-coral md:mx-8">
					Sync error: {$firebaseConnection.error}
				</p>
			{/if}
			{#if $authState.error}
				<p class="mx-5 mt-5 rounded-2xl bg-butter px-5 py-3 text-sm text-ink md:mx-8">
					Session notice: {$authState.error}
				</p>
			{/if}
			<main class="p-5 md:p-8 lg:p-10">{@render children()}</main>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-mist">
		<!-- Redirecting unauthenticated visitors to the login route. -->
	</div>
{/if}

<style>
	.profile-avatar-shell {
		position: relative;
		display: inline-grid;
		flex: none;
		place-items: center;
	}

	.profile-orbit {
		position: absolute;
		inset: -3px;
		border: 2px dashed var(--color-coral);
		border-radius: 999px;
		pointer-events: none;
		animation: profile-orbit 4s linear infinite;
	}

	.profile-orbit::after {
		position: absolute;
		top: -3px;
		left: 50%;
		width: 6px;
		height: 6px;
		border: 1px solid var(--color-paper);
		border-radius: 999px;
		background: var(--color-marigold);
		content: '';
		transform: translateX(-50%);
	}

	summary:hover .profile-orbit {
		border-color: var(--color-teal);
		animation: profile-orbit-hover 700ms ease-in-out infinite alternate;
	}

	details[open] .profile-orbit {
		border-style: solid;
		border-color: var(--color-violet);
		animation: profile-orbit-open 900ms cubic-bezier(0.45, 0, 0.55, 1) infinite;
	}

	@keyframes profile-orbit {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes profile-orbit-hover {
		from {
			transform: rotate(0deg) scale(1);
		}
		to {
			transform: rotate(-210deg) scale(1.12);
		}
	}

	@keyframes profile-orbit-open {
		0%,
		100% {
			transform: rotate(0deg) scale(1);
			opacity: 1;
		}
		50% {
			transform: rotate(180deg) scale(1.18);
			opacity: 0.55;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.profile-orbit,
		summary:hover .profile-orbit,
		details[open] .profile-orbit {
			animation: none;
		}
	}

	:global(.admin-shell button) {
		transition:
			filter 150ms ease,
			background-color 150ms ease,
			border-color 150ms ease,
			color 150ms ease;
	}

	@media (hover: hover) {
		:global(.admin-shell button:not(:disabled):not(.admin-no-feedback):hover) {
			filter: brightness(0.9) saturate(1.08);
		}
	}

	:global(.admin-shell button:not(:disabled):not(.admin-no-feedback):active) {
		filter: brightness(0.82) saturate(1.25);
		transition-duration: 70ms;
	}

	:global(.admin-shell button:focus-visible) {
		outline: 3px solid color-mix(in srgb, var(--color-coral) 65%, transparent);
		outline-offset: 3px;
	}

	:global(.admin-shell button:disabled) {
		cursor: not-allowed;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.admin-shell button) {
			transition: none;
		}
	}
</style>
