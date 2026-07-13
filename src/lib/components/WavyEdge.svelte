<script lang="ts">
	// Animated ocean-wave edge for the sticky header.
	// Two tiled periods of the path scroll left so the loop is seamless.
	const period = (offset: number) =>
		[
			`M${offset},28`,
			`C${offset + 100},10 ${offset + 140},46 ${offset + 240},28`,
			`S${offset + 380},10 ${offset + 480},28`,
			`S${offset + 620},46 ${offset + 720},28`,
			`S${offset + 860},10 ${offset + 960},28`,
			`S${offset + 1100},46 ${offset + 1200},28`
		].join(' ');

	const wave = `${period(0)} ${period(1200).replace(/^M1200,28/, 'L1200,28')}`;
	const fill = `${wave} L2400,0 L0,0 Z`;
</script>

<div class="ocean-wave relative block h-5 w-full overflow-hidden md:h-6" aria-hidden="true">
	<!-- softer under-roll -->
	<svg
		class="ocean-wave-track ocean-wave-back absolute inset-y-0 left-0 h-full"
		viewBox="0 0 2400 48"
		preserveAspectRatio="none"
	>
		<path d={fill} class="fill-teal/15" />
		<path d={wave} fill="none" class="stroke-teal/25" stroke-width="1.25" />
	</svg>

	<!-- main paper crest -->
	<svg
		class="ocean-wave-track ocean-wave-front absolute inset-y-0 left-0 h-full"
		viewBox="0 0 2400 48"
		preserveAspectRatio="none"
	>
		<path d={fill} class="fill-paper/90" />
		<path d={wave} fill="none" class="stroke-line" stroke-width="1.5" />
	</svg>
</div>
