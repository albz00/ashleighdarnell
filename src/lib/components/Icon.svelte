<script lang="ts">
	// Tiny inline icon set, thin strokes, minimal. Add names as needed.
	let {
		name,
		size = 16,
		class: className = '',
		style = undefined
	}: {
		name: 'camera' | 'spark' | 'arrow' | 'at' | 'menu' | 'close' | 'asterisk';
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
	{#if name === 'camera'}
		<path d="M3 8h3l2-3h8l2 3h3v11H3z" />
		<circle cx="12" cy="13" r="3.5" />
	{:else if name === 'spark'}
		<path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" />
	{:else if name === 'arrow'}
		<path d="M5 12h14M13 6l6 6-6 6" />
	{:else if name === 'at'}
		<circle cx="12" cy="12" r="4" />
		<path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1" />
	{:else if name === 'menu'}
		<path d="M4 7h16M4 12h16M4 17h16" />
	{:else if name === 'close'}
		<path d="M6 6l12 12M18 6L6 18" />
	{:else if name === 'asterisk'}
		<path d="M12 4v16M5.1 8l13.8 8M18.9 8L5.1 16" />
	{/if}
</svg>
