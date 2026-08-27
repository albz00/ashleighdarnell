<script lang="ts">
	import { banners } from '$lib/content/site';

	let dismissed = $state<string[]>([]);
	const active = $derived($banners.find((banner) => banner.active && !dismissed.includes(banner.id)));
</script>

{#if active}
	<div class="banner-{active.tone} relative z-[60] px-12 py-2.5 text-center text-xs font-semibold tracking-wide">
		<span>{active.message}</span>
		{#if active.linkLabel}
			<a class="ml-2 underline decoration-2 underline-offset-4" href={active.link}>
				{active.linkLabel}
			</a>
		{/if}
		<button
			type="button"
			class="absolute right-4 top-1/2 -translate-y-1/2 text-lg leading-none opacity-65 hover:opacity-100"
			aria-label="Dismiss announcement"
			onclick={() => (dismissed = [...dismissed, active.id])}
		>×</button
		>
	</div>
{/if}
