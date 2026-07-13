<script lang="ts">
	// Minimal icon set: stars + arrows only.
	let {
		name = 'spark',
		size = 16,
		class: className = '',
		style = undefined
	}: {
		name?: 'spark' | 'arrow';
		size?: number;
		class?: string;
		style?: string;
	} = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.5"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
	{style}
	aria-hidden="true"
>
	{#if name === 'spark'}
		<path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" />
	{:else if name === 'arrow'}
		<path d="M5 12h14M13 6l6 6-6 6" />
	{/if}
</svg>
