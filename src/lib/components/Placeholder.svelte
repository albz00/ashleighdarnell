<script lang="ts">
	// Dev-mode image placeholder. Swap for real <img>/<enhanced:img> later.
	let {
		label = 'image',
		ratio = '3/4',
		tint = 'mist',
		class: className = ''
	}: {
		label?: string;
		ratio?: string;
		tint?: 'mist' | 'blush' | 'butter' | 'mint' | 'lilac';
		class?: string;
	} = $props();

	const tints = {
		mist: 'bg-mist',
		blush: 'bg-blush',
		butter: 'bg-butter',
		mint: 'bg-mint',
		lilac: 'bg-lilac'
	};
</script>

<div
	class="relative overflow-hidden rounded-3xl border border-ink/10 {className}"
	style="aspect-ratio: {ratio};"
>
	<div
		class="media-zoom absolute inset-0 flex items-center justify-center {tints[tint]}"
	>
		<svg
			class="absolute inset-0 h-full w-full text-ink/10"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			<path d="M0,0 Q20,32 50,50 T100,100" stroke="currentColor" stroke-width="1" fill="none" />
			<path d="M100,0 Q80,32 50,50 T0,100" stroke="currentColor" stroke-width="1" fill="none" />
		</svg>
		<span
			class="relative rounded-full bg-paper px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted"
		>
			{label}
		</span>
	</div>
</div>
