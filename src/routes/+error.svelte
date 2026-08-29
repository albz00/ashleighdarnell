<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Page not found' : 'Something went wrong'} - Ashleigh Darnell</title>
	<meta
		name="description"
		content={page.status === 404
			? 'The page you requested could not be found.'
			: 'The requested page could not be loaded.'}
	/>
</svelte:head>

<section class="grid min-h-[70vh] place-items-center bg-paper px-5 py-24 text-center">
	<div class="max-w-2xl">
		<p class="font-cursive text-7xl leading-none text-coral">
			{page.status === 404 ? '404' : page.status}
		</p>
		<h1 class="page-section-title font-display mt-5">
			{page.status === 404 ? 'This trail leads nowhere.' : 'Something went wrong.'}
		</h1>
		<p class="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted">
			{page.status === 404
				? 'The page may have moved, or the address may have been typed incorrectly. Let’s get you back to familiar ground.'
				: page.error?.message || 'Please try again in a moment.'}
		</p>
		<div class="mt-8 flex flex-wrap justify-center gap-3">
			<a
				href="/"
				class="btn-fun rounded-full bg-coral px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-paper"
			>
				Go home
			</a>
			<a
				href="/contact"
				class="rounded-full border border-line bg-paper px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-ink"
			>
				Contact Ashleigh
			</a>
		</div>
	</div>
</section>
