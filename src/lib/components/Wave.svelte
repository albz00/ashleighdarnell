<script lang="ts">
	// Full-width wavy section divider. Place directly above a tinted section
	// (fill = the section's background) so the section's top edge undulates.
	let {
		fill = 'mist',
		flip = false,
		size = 'sm',
		class: className = ''
	}: {
		fill?:
			| 'paper'
			| 'mist'
			| 'blush'
			| 'butter'
			| 'mint'
			| 'lilac'
			| 'teal'
			| 'violet'
			| 'coral'
			| 'ink';
		flip?: boolean;
		size?: 'sm' | 'lg';
		class?: string;
	} = $props();

	// Small toothy divider (legacy) vs. large smooth flowing wave.
	const segments = Array.from({ length: 19 }, (_, i) => `T${120 + i * 60},10`).join(' ');
	const smallPath = `M0,20 L0,10 Q30,0 60,10 ${segments} L1200,20 Z`;
	const smallView = '0 0 1200 20';

	const largePath =
		'M0,120 L0,64 C160,4 320,124 480,64 C640,4 800,124 960,64 C1120,24 1160,84 1200,64 L1200,120 Z';
	const largeView = '0 0 1200 120';

	const d = $derived(size === 'lg' ? largePath : smallPath);
	const viewBox = $derived(size === 'lg' ? largeView : smallView);
	const sizeClass = $derived(size === 'lg' ? 'h-12 md:h-24' : 'h-4 md:h-5');
</script>

<svg
	{viewBox}
	preserveAspectRatio="none"
	class="-mb-px block w-full {sizeClass} {flip ? 'rotate-180' : ''} {className}"
	aria-hidden="true"
>
	<path {d} fill="var(--color-{fill})" />
</svg>
