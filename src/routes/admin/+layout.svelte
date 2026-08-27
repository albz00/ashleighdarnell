<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { signOut } from 'firebase/auth';
	import { auth, authState } from '$lib/firebase/client';
	import { firebaseConnection } from '$lib/firebase/repository';

	let { children } = $props();
	let mobileOpen = $state(false);

	const isLogin = $derived(page.url.pathname === '/admin/login');
	const links = [
		{ href: '/admin', label: 'Overview' },
		{ href: '/admin/content', label: 'Content' },
		{ href: '/admin/blog', label: 'Blog posts' },
		{ href: '/admin/newsletter', label: 'Newsletter' },
		{ href: '/admin/banners', label: 'Banners' },
		{ href: '/admin/theme', label: 'Site theme' }
	];

	$effect(() => {
		if (browser && !isLogin && !$authState.loading && !$authState.user) goto('/admin/login');
	});

	async function logout() {
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
		</div>
	</div>
{:else if $authState.user}
	<div class="min-h-screen bg-mist lg:grid lg:grid-cols-[17rem_1fr]">
		{#if mobileOpen}
			<button
				class="fixed inset-0 z-30 bg-ink/30 lg:hidden"
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
				<div class="ml-auto flex items-center gap-3">
					<div class="text-right">
						<p class="max-w-52 truncate text-sm font-semibold">{$authState.user.email}</p>
					</div>
					<div class="grid h-10 w-10 place-items-center rounded-full bg-coral font-display text-paper">A</div>
				</div>
			</header>
			{#if $firebaseConnection.error}
				<p class="mx-5 mt-5 rounded-2xl bg-blush px-5 py-3 text-sm text-coral md:mx-8">
					Sync error: {$firebaseConnection.error}
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
