<script lang="ts">
	import { pageContent } from '$lib/content/page-content';
	import { siteNavigation } from '$lib/content/navigation';
	import { subscribeToNewsletter } from '$lib/firebase/repository';
	import Wave from './Wave.svelte';

	let email = $state('');
	let signupMessage = $state('');
	const global = $derived($pageContent.global);

	async function subscribe() {
		const cleanEmail = email.trim().toLowerCase();
		if (!cleanEmail || !cleanEmail.includes('@')) {
			signupMessage = global.newsletterInvalid;
			return;
		}
		try {
			await subscribeToNewsletter('Newsletter reader', cleanEmail);
			email = '';
			signupMessage = global.newsletterSuccess;
		} catch (error: unknown) {
			const code =
				error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
			signupMessage =
				code === 'permission-denied'
					? `${global.newsletterExisting} If not, signup permissions still need to be enabled.`
					: 'Signup is temporarily unavailable. Please try again.';
		}
	}
</script>

<Wave fill="ink" class="relative -mt-4 md:-mt-5" />
<footer class="bg-ink text-paper">
	<div class="mx-auto grid max-w-6xl gap-12 px-5 pt-16 pb-14 md:grid-cols-2 md:px-8 lg:grid-cols-[1.5fr_0.8fr_1.2fr]">
		<div class="max-w-md">
			<a href="/" class="inline-flex items-baseline gap-2" aria-label="{global.firstName} {global.lastName}, home">
				<span class="font-display text-3xl md:text-4xl">{global.firstName}</span>
				<span class="font-cursive -rotate-3 text-5xl leading-none text-coral md:text-6xl">{global.lastName}</span>
			</a>
			<p class="mt-5 max-w-sm text-sm leading-relaxed text-paper/65">
				{global.footerTagline}
			</p>
			<a
				href="/contact"
				class="btn-fun mt-7 inline-flex rounded-full bg-paper px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink hover:bg-butter"
			>
				{global.footerCtaLabel}
			</a>
		</div>

		<nav aria-label="Footer navigation">
			<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/45">{global.footerExploreTitle}</p>
			<ul class="mt-5 space-y-3 text-sm">
				<li><a href="/" class="transition-colors hover:text-coral">{global.homeLabel}</a></li>
				{#each siteNavigation as link}
					<li><a href={link.href} class="transition-colors hover:text-coral">{link.label}</a></li>
				{/each}
			</ul>
		</nav>

		<div>
			<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/45">{global.newsletterTitle}</p>
			<p class="mt-5 text-sm leading-relaxed text-paper/65">
				{global.newsletterDescription}
			</p>
			<form class="mt-4 flex gap-2" onsubmit={(event) => { event.preventDefault(); subscribe(); }}>
				<label class="sr-only" for="footer-email">Email address</label>
				<input
					id="footer-email"
					type="email"
					bind:value={email}
					placeholder={global.newsletterPlaceholder}
					class="min-w-0 flex-1 rounded-full border border-paper/20 bg-paper/10 px-4 py-2.5 text-sm text-paper outline-none placeholder:text-paper/35 focus:border-coral"
				/>
				<button type="submit" class="rounded-full bg-coral px-4 py-2 text-xs font-semibold text-paper">
					{global.newsletterButton}
				</button>
			</form>
			{#if signupMessage}<p class="mt-2 text-xs text-paper/55">{signupMessage}</p>{/if}
		</div>
	</div>

	<div class="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 border-t border-paper/10 px-5 py-6 text-[11px] text-paper/40 md:px-8">
		<span>© {new Date().getFullYear()} {global.firstName} {global.lastName}</span>
		<a href="/admin/login" class="transition-colors hover:text-paper">{global.adminLabel}</a>
	</div>
</footer>
