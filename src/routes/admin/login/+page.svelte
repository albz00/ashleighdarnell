<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		GoogleAuthProvider,
		signInWithEmailAndPassword,
		signInWithPopup
	} from 'firebase/auth';
	import { auth, authReady, authState } from '$lib/firebase/client';

	let email = $state('');
	let password = $state('');
	let loading = $state<'email' | 'google' | null>(null);
	let errorMessage = $state('');

	$effect(() => {
		if ($authState.user) goto('/admin');
	});

	function loginError(error: unknown) {
		const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
		if (error instanceof Error && error.message.includes('administrator access')) return error.message;
		if (
			code === 'auth/invalid-credential' ||
			code === 'auth/user-not-found' ||
			code === 'auth/wrong-password'
		)
			return 'The email or password is incorrect.';
		if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait and try again.';
		if (code === 'auth/network-request-failed') return 'Could not reach the server. Check your connection.';
		if (code === 'auth/popup-closed-by-user') return 'Google sign-in was closed before completion.';
		if (code === 'auth/popup-blocked') return 'Allow pop-ups for this site to use Google sign-in.';
		return 'Sign-in failed. Please try again or contact the site administrator.';
	}

	async function login() {
		if (!auth) {
			errorMessage = 'Sign-in is temporarily unavailable.';
			return;
		}
		loading = 'email';
		errorMessage = '';
		try {
			await authReady;
			await signInWithEmailAndPassword(auth, email.trim(), password);
		} catch (error: unknown) {
			errorMessage = loginError(error);
		} finally {
			loading = null;
		}
	}

	async function loginWithGoogle() {
		if (!auth) {
			errorMessage = 'Sign-in is temporarily unavailable.';
			return;
		}
		loading = 'google';
		errorMessage = '';
		try {
			await authReady;
			const provider = new GoogleAuthProvider();
			provider.setCustomParameters({ prompt: 'select_account' });
			await signInWithPopup(auth, provider);
		} catch (error: unknown) {
			errorMessage = loginError(error);
		} finally {
			loading = null;
		}
	}
</script>

<svelte:head><title>Admin login - Ashleigh Darnell</title></svelte:head>

<div class="grid min-h-screen bg-paper lg:grid-cols-2">
	<div class="relative hidden overflow-hidden lg:block">
		<img
			src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=85"
			alt="Sunlit forest"
			class="absolute inset-0 h-full w-full object-cover"
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent"></div>
		<div class="absolute bottom-12 left-12 max-w-lg text-paper">
			<p class="font-cursive text-6xl text-coral">Welcome back</p>
			<p class="mt-4 text-lg text-paper/80">Manage stories, readers, announcements, and the look of your site.</p>
		</div>
	</div>
	<div class="flex items-center justify-center px-5 py-16">
		<div class="w-full max-w-md">
			<a href="/" class="font-display text-2xl">Ashleigh <span class="font-cursive text-4xl text-coral">Darnell</span></a>
			<h1 class="font-display mt-12 text-5xl">Sign in</h1>
			<p class="mt-4 text-sm leading-relaxed text-muted">
				Sign in with an approved administrator account to open the website studio.
			</p>

			<div class="mt-9">
				{#if errorMessage || $authState.error}
					<p class="mb-5 rounded-2xl bg-blush px-4 py-3 text-sm text-coral" role="alert">
						{errorMessage || $authState.error}
					</p>
				{/if}
				<button
					type="button"
					onclick={loginWithGoogle}
					disabled={loading !== null}
					class="w-full rounded-full border border-line bg-paper px-6 py-4 text-sm font-semibold transition-colors hover:border-ink hover:bg-mist disabled:opacity-60"
				>
					{loading === 'google' ? 'Connecting to Google…' : 'Continue with Google'}
				</button>
				<div class="my-6 flex items-center gap-4">
					<div class="h-px flex-1 bg-line"></div>
					<span class="text-[10px] uppercase tracking-[0.18em] text-muted">or use email</span>
					<div class="h-px flex-1 bg-line"></div>
				</div>
			</div>

			<form class="space-y-5" onsubmit={(event) => { event.preventDefault(); login(); }}>
				<label class="block">
					<span class="text-xs font-semibold">Email address</span>
					<input
						type="email"
						bind:value={email}
						class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3.5 outline-none focus:border-coral"
					/>
				</label>
				<label class="block">
					<span class="text-xs font-semibold">Password</span>
					<input
						type="password"
						bind:value={password}
						class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3.5 outline-none focus:border-coral"
					/>
				</label>
				<button
					type="submit"
					disabled={loading !== null}
					class="btn-fun w-full rounded-full bg-coral px-6 py-4 text-sm font-semibold text-paper disabled:opacity-60"
				>
					{loading === 'email' ? 'Opening studio…' : 'Login to studio'}
				</button>
			</form>
			<a href="/" class="mt-8 inline-block text-sm text-muted hover:text-ink">← Back to website</a>
		</div>
	</div>
</div>
