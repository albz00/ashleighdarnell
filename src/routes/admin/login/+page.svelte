<script lang="ts">
	import { goto } from '$app/navigation';
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import { auth, authState } from '$lib/firebase/client';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let errorMessage = $state('');

	$effect(() => {
		if ($authState.user) goto('/admin');
	});

	async function login() {
		if (!auth) {
			errorMessage = 'Firebase Authentication is unavailable.';
			return;
		}
		loading = true;
		errorMessage = '';
		try {
			await signInWithEmailAndPassword(auth, email.trim(), password);
			await goto('/admin');
		} catch (error: unknown) {
			const code =
				error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
			errorMessage =
				code === 'auth/invalid-credential' ||
				code === 'auth/user-not-found' ||
				code === 'auth/wrong-password'
					? 'The email or password is incorrect.'
					: code === 'auth/too-many-requests'
						? 'Too many attempts. Please wait and try again.'
						: code === 'auth/network-request-failed'
							? 'Could not reach Firebase. Check your connection.'
							: 'Sign-in failed. Confirm Email/Password authentication is enabled in Firebase.';
		} finally {
			loading = false;
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
				Use the administrator account created in Firebase Authentication.
			</p>

			<form class="mt-9 space-y-5" onsubmit={(event) => { event.preventDefault(); login(); }}>
				{#if errorMessage}
					<p class="rounded-2xl bg-blush px-4 py-3 text-sm text-coral" role="alert">{errorMessage}</p>
				{/if}
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
					disabled={loading}
					class="btn-fun w-full rounded-full bg-coral px-6 py-4 text-sm font-semibold text-paper disabled:opacity-60"
				>
					{loading ? 'Opening studio…' : 'Login to studio'}
				</button>
			</form>
			<a href="/" class="mt-8 inline-block text-sm text-muted hover:text-ink">← Back to website</a>
		</div>
	</div>
</div>
