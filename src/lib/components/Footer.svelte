<script lang="ts">
	import Wave from './Wave.svelte';
</script>

<Wave fill="ink" />
<footer class="bg-ink text-paper">
	<div
		class="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-8"
	>
		<div>
			<p class="font-display text-2xl">Ashleigh Darnell</p>
			<p class="mt-2 max-w-xs text-sm text-paper/60">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit.
			</p>
		</div>

		<nav class="flex gap-6 text-[12px] uppercase tracking-[0.15em] text-paper/60" aria-label="Footer">
			<a
				href="/photography"
				class="underline decoration-coral decoration-2 underline-offset-4 transition-colors hover:text-coral"
				>Photography</a
			>
			<a
				href="/social"
				class="underline decoration-teal decoration-2 underline-offset-4 transition-colors hover:text-teal"
				>Social Media</a
			>
			<a
				href="/about"
				class="underline decoration-marigold decoration-2 underline-offset-4 transition-colors hover:text-marigold"
				>About</a
			>
			<a
				href="/contact"
				class="underline decoration-violet decoration-2 underline-offset-4 transition-colors hover:text-violet"
				>Contact</a
			>
		</nav>
	</div>

	<div class="border-t border-paper/15">
		<p class="mx-auto max-w-6xl px-5 py-4 text-[11px] uppercase tracking-[0.2em] text-paper/50 md:px-8">
			&copy; {new Date().getFullYear()} Ashleigh Darnell
		</p>
	</div>
</footer>
