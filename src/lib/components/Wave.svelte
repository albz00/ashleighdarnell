<script lang="ts">
	// Full-width wavy section divider. Place directly above a tinted section
	// (fill = the section's background) so the section's top edge undulates.
	let {
		fill = 'mist',
		flip = false,
		class: className = ''
	}: {
		fill?: 'mist' | 'blush' | 'butter' | 'mint' | 'lilac' | 'violet' | 'ink';
		flip?: boolean;
		class?: string;
	} = $props();

	const segments = Array.from({ length: 19 }, (_, i) => `T${120 + i * 60},10`).join(' ');
	const d = `M0,20 L0,10 Q30,0 60,10 ${segments} L1200,20 Z`;
</script>

<svg
	viewBox="0 0 1200 20"
	preserveAspectRatio="none"
	class="block h-4 w-full md:h-5 {flip ? 'rotate-180' : ''} {className}"
	aria-hidden="true"
>
	<path {d} fill="var(--color-{fill})" />
</svg>
