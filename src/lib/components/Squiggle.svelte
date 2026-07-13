<script lang="ts">
	// Small decorative squiggle — draws itself when revealed / on load.
	let {
		class: className = '',
		width = 96,
		animate = true
	}: { class?: string; width?: number; animate?: boolean } = $props();
</script>

<svg
	{width}
	height="12"
	viewBox="0 0 96 12"
	fill="none"
	class="{animate ? 'squiggle-animate' : ''} {className}"
	aria-hidden="true"
>
	<path
		class={animate ? 'squiggle-path' : ''}
		d="M2,6 Q8,0 14,6 T26,6 T38,6 T50,6 T62,6 T74,6 T86,6 T94,6"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
	/>
</svg>
